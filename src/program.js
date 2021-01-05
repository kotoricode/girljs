import { gl } from "./dom";

import vsStandard from "./shaders/vert-standard.glsl";
import fsGray     from "./shaders/frag-gray.glsl";
import vsSprite   from "./shaders/vert-sprite.glsl";
import fsSprite   from "./shaders/frag-sprite.glsl";
import vsTiled    from "./shaders/vert-tiled.glsl";
import fsTiled    from "./shaders/frag-tiled.glsl";
import vsColor    from "./shaders/vert-color.glsl";
import fsColor    from "./shaders/frag-color.glsl";

import { getModelBuffer } from "./model";

import * as $ from "./const";

const createAttachShader = (program, shaderId, { shaderSrc }) =>
{
    const shader = gl.createShader(shaderId);
    gl.shaderSource(shader, shaderSrc);
    gl.compileShader(shader);
    gl.attachShader(program, shader);

    return shader;
};

const detachDeleteShader = (program, shader) =>
{
    gl.detachShader(program, shader);
    gl.deleteShader(shader);
};

export const setupModelVao = (programData, attrOffsets) =>
{
    const { program, vao, attributes } = programData;

    gl.bindVertexArray(vao);

    const modelBuffer = getModelBuffer();
    gl.bindBuffer($.ARRAY_BUFFER, modelBuffer);

    for (const [name, layout] of Object.entries(attributes))
    {
        if (!(name in attrOffsets))
        {
            throw name;
        }

        const location = gl.getAttribLocation(program, name);
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, ...layout, attrOffsets[name]);
    }

    gl.bindBuffer($.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);
};

export const createProgramData = (programId) =>
{
    const {
        program,
        uniDefaults,
        uniSetters,
        attributes
    } = preparedPrograms.get(programId);

    const vao = gl.createVertexArray();

    const uniValues = new Map();

    for (const [name, defaults] of uniDefaults)
    {
        uniValues.set(name, defaults.slice());
    }

    return {
        program,
        vao,
        uniSetters,
        uniValues,
        attributes
    };
};

// TODO: maybe move defs to a different file to reduce clutter here
/*------------------------------------------------------------------------------
    Templates
------------------------------------------------------------------------------*/
const attrPos = {
    [$.A_POSITION]: [2, $.FLOAT, false, 0],
};

const attrPosUv = {
    [$.A_POSITION]: [2, $.FLOAT, false, 0],
    [$.A_UV]: [2, $.FLOAT, false, 0],
};

const uniTransVP = {
    [$.U_TRANSFORM]: [false, null],
    [$.U_VIEWPROJECTION]: [false, null],
};

const uniColor = {
    [$.U_COLOR]: [1, 1, 1, 1]
};

const uniUvRepeat = {
    [$.U_UVREPEAT]: [1, 1]
};

const uniUvOffsetSize = {
    [$.U_UVOFFSET]: [0, 0],
    [$.U_UVSIZE]: [0, 0]
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
    $.PROGRAM_TILED,  vertDef.tiled,    fragDef.tiled
];

/*------------------------------------------------------------------------------
    Create and prepare programs
------------------------------------------------------------------------------*/
const createUniSetter = (type, loc) => (values) => gl[type](loc, ...values);

const setUniSetters = ({ uniforms }, program, uniDefaults, uniSetters) =>
{
    if (uniforms)
    {
        for (const [type, typeObj] of Object.entries(uniforms))
        {
            for (const [name, defValueArr] of Object.entries(typeObj))
            {
                uniDefaults.set(name, defValueArr);
                const location = gl.getUniformLocation(program, name);
                const uniSetter = createUniSetter(type, location);
                uniSetters.set(name, uniSetter);
            }
        }
    }
};

const preparedPrograms = new Map();

let i = 0;
while (i < newProgramDef.length)
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

    setUniSetters(vert, program, uniDefaults, uniSetters);
    setUniSetters(frag, program, uniDefaults, uniSetters);

    preparedPrograms.set(programId, {
        program,
        uniDefaults,
        uniSetters,
        attributes
    });
}
