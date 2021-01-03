import { gl } from "./dom";

import vsStandard from "./shaders/vert-standard.glsl";
import fsGray     from "./shaders/frag-gray.glsl";
import vsSprite   from "./shaders/vert-sprite.glsl";
import fsSprite   from "./shaders/frag-sprite.glsl";
import vsTiled    from "./shaders/vert-tiled.glsl";
import fsTiled    from "./shaders/frag-tiled.glsl";

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

const createUniSetter = (type, location) =>
{
    return (values) =>
    {
        gl[type](location, ...values);
    };
};

export const createProgramData = (programId, attrOffsets) =>
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

    const modelBuffer = getModelBuffer();
    gl.bindBuffer($.ARRAY_BUFFER, modelBuffer);

    for (const [name, layout] of Object.entries(attributes))
    {
        const location = gl.getAttribLocation(program, name);
        gl.enableVertexAttribArray(location);
        gl.vertexAttribPointer(location, ...layout, attrOffsets[name]);
    }

    gl.bindBuffer($.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);

    return {
        program,
        vao,
        uniSetters,
        uniValues
    };
};

const attrPosUv = {
    [$.A_POSITION]: [2, $.FLOAT, false, 0],
    [$.A_UV]: [2, $.FLOAT, false, 0],
};

const uniPosition = {
    [$.U_TRANSFORM]: [false, null],
    [$.U_VIEWPROJECTION]: [false, null],
};

const vertDef = {
    standard: {
        shaderSrc: vsStandard,
        attributes: attrPosUv
    },
    sprite: {
        shaderSrc: vsSprite,
        attributes: attrPosUv,
        uniforms: {
            uniformMatrix4fv: uniPosition
        }
    },
    tiled: {
        shaderSrc: vsTiled,
        attributes: attrPosUv,
        uniforms: {
            uniformMatrix4fv: uniPosition,
            uniform2f: {
                [$.U_UVREPEAT]: [1, 1]
            },
        }
    }
};

const fragDef = {
    gray: {
        shaderSrc: fsGray
    },
    sprite: {
        shaderSrc: fsSprite,
        uniforms: {
            uniform4f: {
                [$.U_COLOR]: [1, 1, 1, 1]
            }
        }
    },
    tiled: {
        shaderSrc: fsTiled,
        uniforms: {
            uniform2f: {
                [$.U_UVOFFSET]: [0, 0],
                [$.U_UVSIZE]: [0, 0]
            },
            uniform4f: {
                [$.U_COLOR]: [1, 1, 1, 1]
            }
        }
    }
};

const programDef = new Map([
    [$.PROGRAM_GRAY, {
        vert: vertDef.standard,
        frag: fragDef.gray
    }],
    [$.PROGRAM_SPRITE, {
        vert: vertDef.sprite,
        frag: fragDef.sprite
    }],
    [$.PROGRAM_TILED, {
        vert: vertDef.tiled,
        frag: fragDef.tiled,
    }]
]);

const preparedPrograms = new Map();

for (const [programId, data] of programDef)
{
    const { vert, frag } = data;

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

    for (const vertFrag of Object.values(data))
    {
        if (vertFrag.uniforms)
        {
            for (const [type, typeObj] of Object.entries(vertFrag.uniforms))
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
    }

    preparedPrograms.set(programId, {
        program,
        uniDefaults,
        uniSetters,
        attributes: vert.attributes
    });
}
