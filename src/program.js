import { gl } from "./dom";

import vsStandard from "./shaders/vert-standard.glsl";
import fsGray     from "./shaders/frag-gray.glsl";
import vsSprite   from "./shaders/vert-sprite.glsl";
import fsSprite   from "./shaders/frag-sprite.glsl";
import vsTiled    from "./shaders/vert-tiled.glsl";
import fsTiled    from "./shaders/frag-tiled.glsl";

import * as ENUM_GL from "./enum-gl";
import * as CONST from "./const";
import { getModelBuffer } from "./model";

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

export const createProgramData = (programId, attrData) =>
{
    const {
        program,
        uniSetters,
        uniDefaults,
        attrLocations,
        attributes
    } = programData.get(programId);

    /*--------------------------------------------------------------------------
        Uniforms
    --------------------------------------------------------------------------*/
    const uniforms = new Map();

    for (const [name, defaults] of uniDefaults)
    {
        uniforms.set(name, defaults.slice());
    }

    /*--------------------------------------------------------------------------
        Attributes
    --------------------------------------------------------------------------*/
    const vao = gl.createVertexArray();

    gl.bindVertexArray(vao);
    const modelBuffer = getModelBuffer();
    gl.bindBuffer(ENUM_GL.ARRAY_BUFFER, modelBuffer);

    for (const [name, defaults] of Object.entries(attributes))
    {
        const loc = attrLocations.get(name);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, ...defaults, attrData[name]);
    }

    gl.bindVertexArray(null);
    gl.bindBuffer(ENUM_GL.ARRAY_BUFFER, null);

    return {
        program,
        uniSetters,
        vao,
        uniforms
    };
};

const attrPosUv = {
    [CONST.A_POS]: [2, ENUM_GL.FLOAT, false, 0],
    [CONST.A_UV]: [2, ENUM_GL.FLOAT, false, 0],
};

const uniModelVp = {
    [CONST.U_MODEL]: [false, null],
    [CONST.U_VP]: [false, null],
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
            uniformMatrix4fv: uniModelVp
        }
    },
    tiled: {
        shaderSrc: vsTiled,
        attributes: attrPosUv,
        uniforms: {
            uniformMatrix4fv: uniModelVp,
            uniform2f: {
                [CONST.U_UVREPEAT]: [1, 1]
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
                [CONST.U_COLOR]: [1, 1, 1, 1]
            }
        }
    },
    tiled: {
        shaderSrc: fsTiled,
        uniforms: {
            uniform2f: {
                [CONST.U_UVOFFSET]: [0, 0],
                [CONST.U_UVSIZE]: [0, 0]
            },
            uniform4f: {
                [CONST.U_COLOR]: [1, 1, 1, 1]
            }
        }
    }
};

const programDef = new Map([
    [CONST.PROGRAM_GRAY, {
        vert: vertDef.standard,
        frag: fragDef.gray
    }],
    [CONST.PROGRAM_SPRITE, {
        vert: vertDef.sprite,
        frag: fragDef.sprite
    }],
    [CONST.PROGRAM_TILED, {
        vert: vertDef.tiled,
        frag: fragDef.tiled,
    }]
]);

const programData = new Map();

for (const [id, data] of programDef)
{
    const { vert, frag } = data;

    /*--------------------------------------------------------------------------
        Program
    --------------------------------------------------------------------------*/
    const program = gl.createProgram();

    const vs = createAttachShader(program, ENUM_GL.VERTEX_SHADER, vert),
          fs = createAttachShader(program, ENUM_GL.FRAGMENT_SHADER, frag);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, ENUM_GL.LINK_STATUS))
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
                    const loc = gl.getUniformLocation(program, name);

                    // TODO: probably better to hardcode each type
                    // instead of looking up gl[type] on the fly
                    uniSetters.set(name, (values) =>
                    {
                        gl[type](loc, ...values);
                    });
                }
            }
        }
    }

    /*--------------------------------------------------------------------------
        Attributes
    --------------------------------------------------------------------------*/
    const { attributes } = vert,
          attrLocations = new Map();

    for (const name of Object.keys(attributes))
    {
        attrLocations.set(name, gl.getAttribLocation(program, name));
    }

    programData.set(id, {
        program,
        uniDefaults,
        uniSetters,
        attributes,
        attrLocations
    });
}
