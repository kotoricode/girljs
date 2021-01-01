import { gl } from "./dom";

import vsStandard from "./shaders/vert-standard.glsl";
import fsGray     from "./shaders/frag-gray.glsl";
import vsSprite   from "./shaders/vert-sprite.glsl";
import fsSprite   from "./shaders/frag-sprite.glsl";
import vsTiled    from "./shaders/vert-tiled.glsl";
import fsTiled    from "./shaders/frag-tiled.glsl";

import * as ENUM_GL from "./enum-gl";
import * as CONST from "./const";
import { bindModelBuffer, unbindModelBuffer } from "./model";

const createShader = (prog, shaderId, shaderDef) =>
{
    const shader = gl.createShader(shaderId);
    gl.shaderSource(shader, shaderDef.shaderSrc);
    gl.compileShader(shader);
    gl.attachShader(prog, shader);

    return shader;
};

const deleteShader = (program, shader) =>
{
    gl.detachShader(program, shader);
    gl.deleteShader(shader);
};

const createProgram = (vert, frag) =>
{
    const prog = gl.createProgram();

    const vertShader = createShader(prog, ENUM_GL.VERTEX_SHADER, vert),
          fragShader = createShader(prog, ENUM_GL.FRAGMENT_SHADER, frag);

    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, ENUM_GL.LINK_STATUS))
    {
        throw gl.getProgramInfoLog(prog);
    }

    deleteShader(prog, vertShader);
    deleteShader(prog, fragShader);

    return prog;
};

export const createProgramData = (programId, attrData) =>
{
    const {
        program,
        setUniFuncs,
        uniDefaults,
        attrLocations,
        attributes
    } = programData.get(programId);

    // Attributes
    const vao = gl.createVertexArray();

    gl.bindVertexArray(vao);
    bindModelBuffer();

    for (const [name, defaults] of Object.entries(attributes))
    {
        const loc = attrLocations.get(name);
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, ...defaults, attrData[name]);
    }

    gl.bindVertexArray(null);
    unbindModelBuffer();

    // Uniforms
    const uniforms = new Map();

    for (const [name, defaults] of uniDefaults.entries())
    {
        uniforms.set(name, defaults.slice());
    }

    return {
        program,
        setUniFuncs,
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
    const program = createProgram(data.vert, data.frag);

    // Uniforms
    const uniDefaults = new Map(),
          setUniFuncs = new Map();

    for (const vertFrag of Object.values(data))
    {
        if (!vertFrag.uniforms)
        {
            continue;
        }

        for (const [type, typeObj] of Object.entries(vertFrag.uniforms))
        {
            for (const [name, defValueArr] of Object.entries(typeObj))
            {
                uniDefaults.set(name, defValueArr);
                const loc = gl.getUniformLocation(program, name);

                setUniFuncs.set(name, (values) =>
                {
                    gl[type](loc, ...values);
                });
            }
        }
    }

    // Attributes
    const attributes = data.vert.attributes,
          attrLocations = new Map();

    for (const name of Object.keys(attributes))
    {
        attrLocations.set(name, gl.getAttribLocation(program, name));
    }

    programData.set(id, {
        program,
        uniDefaults,
        setUniFuncs,
        attributes,
        attrLocations
    });
}
