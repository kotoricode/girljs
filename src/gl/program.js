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
import { bindVao, unbindVao } from "./gl-helper";

const createAttachShader = (program, shaderId, vertFrag) =>
{
    const shader = gl.createShader(shaderId);
    gl.shaderSource(shader, vertFrag.src);
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
    bindVao(vao);
    bindBuffer(bufferId);

    for (const [name, layout] of Object.entries(attributes))
    {
        if (!(name in attrOffsets))
        {
            throw name;
        }

        const pos = gl.getAttribLocation(program, name);
        gl.enableVertexAttribArray(pos);
        gl.vertexAttribPointer(pos, ...layout, attrOffsets[name]);
    }

    unbindBuffer();
    unbindVao();

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

// const attrPos = [$.A_POSITION];
// const attrPosUv = [$.A_POSITION, $.A_UV];

const attrLayout2 = [2, $.FLOAT, false, 0];
const attrLayout3 = [3, $.FLOAT, false, 0];

const attrPos = {
    [$.A_POSITION]: attrLayout3
};

const attrPosUv = {
    [$.A_POSITION]: attrLayout3,
    [$.A_UV]: attrLayout2,
};

const uniTransVP = {
    [$.U_TRANSFORM]: uniArrZeroZero,
    [$.U_VIEWPROJECTION]: uniArrZeroZero,
};

const uniVP = {
    [$.U_VIEWPROJECTION]: uniArrZeroZero
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
        src: vsColor,
        uniforms: {
            uniformMatrix4fv: uniVP
        },
        attributes: attrPos
    },
    standard: {
        src: vsStandard,
        attributes: attrPosUv
    },
    sprite: {
        src: vsSprite,
        attributes: attrPosUv,
        uniforms: {
            uniformMatrix4fv: uniTransVP
        }
    },
    tiled: {
        src: vsTiled,
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
        src: fsColor
    },
    gray: {
        src: fsGray
    },
    sprite: {
        src: fsSprite,
        uniforms: {
            uniform4f: uniColor
        }
    },
    tiled: {
        src: fsTiled,
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
