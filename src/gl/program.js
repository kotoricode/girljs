import * as $ from "../const";
import { gl } from "../dom";
import { bindBuffer, unbindBuffer } from "./buffer";

import vsStandard from "./shaders/standard.vert";
import fsGray     from "./shaders/gray.frag";
import vsSprite   from "./shaders/sprite.vert";
import fsSprite   from "./shaders/sprite.frag";
import vsTiled    from "./shaders/tiled.vert";
import fsTiled    from "./shaders/tiled.frag";
import vsColor    from "./shaders/color.vert";
import fsColor    from "./shaders/color.frag";

const createAttachShader = (program, shaderId, { shaderSrc }) =>
{
    const shader = gl.createShader(shaderId);
    gl.shaderSource(shader, shaderSrc);
    gl.compileShader(shader);
    gl.attachShader(program, shader);

    return shader;
};

export const createProgramData = (programId, attrOffsets, bufferId) =>
{
    const {
        program,
        uniDefaults,
        uniSetters,
        attributes
    } = preparedPrograms.get(programId);

    /*--------------------------------------------------------------------------
        Uniforms
    --------------------------------------------------------------------------*/
    const uniValues = new Map();

    for (const [name, defaults] of uniDefaults)
    {
        uniValues.set(name, defaults.slice());
    }

    /*--------------------------------------------------------------------------
        Attributes
    --------------------------------------------------------------------------*/
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    bindBuffer(bufferId);

    for (const name of attributes)
    {
        if (!(name in attrOffsets))
        {
            throw name;
        }

        const pos = gl.getAttribLocation(program, name);
        gl.enableVertexAttribArray(pos);
        gl.vertexAttribPointer(pos, 2, $.FLOAT, false, 0, attrOffsets[name]);
    }

    unbindBuffer();
    gl.bindVertexArray(null);

    return {
        program,
        vao,
        uniSetters,
        uniValues
    };
};

const createUniSetter = (type, loc) => (values) => gl[type](loc, ...values);

const detachDeleteShader = (program, shader) =>
{
    gl.detachShader(program, shader);
    gl.deleteShader(shader);
};

/*------------------------------------------------------------------------------
    Templates
------------------------------------------------------------------------------*/
// also works with uniformMatrix [transpose, value]
const uniArrZeroZero = [0, 0];

const attrPos = [$.A_POSITION];
const attrPosUv = [$.A_POSITION, $.A_UV];

const uniTransVP = {
    [$.U_TRANSFORM]: uniArrZeroZero,
    [$.U_VIEWPROJECTION]: uniArrZeroZero,
};

const uniColor = {
    [$.U_COLOR]: [1, 1, 1, 1]
};

const uniUvRepeat = {
    [$.U_UVREPEAT]: [1, 1]
};

const uniUvOffsetSize = {
    [$.U_UVOFFSET]: uniArrZeroZero,
    [$.U_UVSIZE]: uniArrZeroZero
};

/*------------------------------------------------------------------------------
    Vertex shader definitions
------------------------------------------------------------------------------*/
const vertDef = {
    color: {
        shaderSrc: vsColor,
        attributes: attrPos
    },
    standard: {
        shaderSrc: vsStandard,
        attributes: attrPosUv
    },
    sprite: {
        shaderSrc: vsSprite,
        attributes: attrPosUv,
        uniforms: {
            uniformMatrix4fv: uniTransVP
        }
    },
    tiled: {
        shaderSrc: vsTiled,
        attributes: attrPosUv,
        uniforms: {
            uniformMatrix4fv: uniTransVP,
            uniform2f: uniUvRepeat
        }
    }
};

/*------------------------------------------------------------------------------
    Fragment shader definitions
------------------------------------------------------------------------------*/
const fragDef = {
    color: {
        shaderSrc: fsColor
    },
    gray: {
        shaderSrc: fsGray
    },
    sprite: {
        shaderSrc: fsSprite,
        uniforms: {
            uniform4f: uniColor
        }
    },
    tiled: {
        shaderSrc: fsTiled,
        uniforms: {
            uniform2f: uniUvOffsetSize,
            uniform4f: uniColor
        }
    }
};

/*------------------------------------------------------------------------------
    Program definitions
------------------------------------------------------------------------------*/
const newProgramDef = [
    $.PROGRAM_GRAY,   vertDef.standard, fragDef.gray,
    $.PROGRAM_SPRITE, vertDef.sprite,   fragDef.sprite,
    $.PROGRAM_TILED,  vertDef.tiled,    fragDef.tiled,
    $.PROGRAM_DEBUG,  vertDef.color,    fragDef.color
];

/*------------------------------------------------------------------------------
    Create and prepare programs
------------------------------------------------------------------------------*/
const preparedPrograms = new Map();

for (let i = 0; i < newProgramDef.length;)
{
    const programId = newProgramDef[i++],
          vert = newProgramDef[i++],
          frag = newProgramDef[i++],
          { attributes } = vert;

    /*--------------------------------------------------------------------------
        Program
    --------------------------------------------------------------------------*/
    const program = gl.createProgram();

    const vs = createAttachShader(program, $.VERTEX_SHADER, vert),
          fs = createAttachShader(program, $.FRAGMENT_SHADER, frag);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, $.LINK_STATUS))
    {
        throw gl.getProgramInfoLog(program);
    }

    detachDeleteShader(program, vs);
    detachDeleteShader(program, fs);

    /*--------------------------------------------------------------------------
        Uniforms
    --------------------------------------------------------------------------*/
    const uniDefaults = new Map(),
          uniSetters = new Map();

    for (const { uniforms } of [vert, frag])
    {
        if (uniforms)
        {
            for (const [type, typeObj] of Object.entries(uniforms))
            {
                for (const [name, defValueArr] of Object.entries(typeObj))
                {
                    const pos = gl.getUniformLocation(program, name);
                    const uniSetter = createUniSetter(type, pos);
                    uniSetters.set(name, uniSetter);
                    uniDefaults.set(name, defValueArr);
                }
            }
        }
    }

    preparedPrograms.set(programId, {
        program,
        uniDefaults,
        uniSetters,
        attributes
    });
}
