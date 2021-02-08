import * as $ from "../const";
import { gl } from "../dom";
import { isSet, SafeMap, SafeSet } from "../utility";
import { Model } from "./model";
import { Buffer } from "./buffer";
import { Matrix } from "../math/matrix";
import { Texture } from "./texture";

import vsDebugSrc  from "./shaders/vert/debug.vert";
import vsUiSrc     from "./shaders/vert/ui.vert";
import vsWorldSrc  from "./shaders/vert/world.vert";

import fsDebugSrc    from "./shaders/frag/debug.frag";
import fsFxaaSrc     from "./shaders/frag/luma.frag";
//import fsGraySrc     from "./shaders/frag/gray.frag";
import fsTexturedSrc from "./shaders/frag/textured.frag";

export class Program
{
    constructor(programId, modelId)
    {
        const prepared = preparedPrograms.get(programId);

        // Program
        this.glProgram = prepared.glProgram;

        // Attributes
        this.aLayout = prepared.aLayout;
        this.vao = gl.createVertexArray();

        // Uniforms
        this.uSetters = prepared.uSetters;
        this.uBlocks = prepared.uBlocks;
        this.uStaging = new SafeMap();
        const uDefaults = prepared.uDefaults;

        for (const [name, values] of uDefaults)
        {
            this.uStaging.set(name, values.slice());
        }

        this.model = null;
        this.setModel(modelId);
        Object.seal(this);
    }

    static init()
    {
        preparedPrograms.clear();

        for (let i = 0; i < programDef.length;)
        {
            const programId = programDef[i++];
            const vert = vertDef.get(programDef[i++]);
            const frag = fragDef.get(programDef[i++]);

            const aLayout = vert.layout;

            /*------------------------------------------------------------------
                Program
            ------------------------------------------------------------------*/
            const program = gl.createProgram();
            const vs = createAttachShader(program, $.VERTEX_SHADER, vert);
            const fs = createAttachShader(program, $.FRAGMENT_SHADER, frag);
            gl.linkProgram(program);

            if (!gl.getProgramParameter(program, $.LINK_STATUS)) throw program;

            detachDeleteShader(program, vs);
            detachDeleteShader(program, fs);

            /*------------------------------------------------------------------
                Uniform blocks
            ------------------------------------------------------------------*/
            const uBlocks = new SafeSet();

            if (vert.uBlocks)
            {
                for (const block of vert.uBlocks)
                {
                    uBlocks.add(block);
                }
            }

            if (frag.uBlocks)
            {
                for (const block of frag.uBlocks)
                {
                    uBlocks.add(block);
                }
            }

            /*------------------------------------------------------------------
                Uniforms
            ------------------------------------------------------------------*/
            const uSetters = new SafeMap();
            const uDefaults = new SafeMap();

            for (const shader of [vert, frag])
            {
                if (shader.uniforms)
                {
                    for (const [type, map] of shader.uniforms)
                    {
                        for (const [name, values] of map)
                        {
                            const pos = gl.getUniformLocation(program, name);
                            const setter = createUniSetter(type, pos);
                            uSetters.set(name, setter);
                            uDefaults.set(name, values);
                        }
                    }
                }
            }

            preparedPrograms.set(programId, new PreparedProgram(
                program,
                aLayout,
                uBlocks,
                uDefaults,
                uSetters
            ));
        }
    }

    activate()
    {
        if (activeProgram !== this.glProgram)
        {
            activeProgram = this.glProgram;
            gl.useProgram(activeProgram);

            for (const blockId of this.uBlocks)
            {
                Buffer.prepareBlock(activeProgram, blockId);
            }
        }
    }

    bindVao()
    {
        if (activeVao === this.vao) throw activeVao;

        activeVao = this.vao;
        gl.bindVertexArray(activeVao);
    }

    delete()
    {
        gl.deleteVertexArray(this.vao);
    }

    getDynamicMesh()
    {
        return Model.getDynamicMesh(this.model.meshId);
    }

    getTexture()
    {
        return Texture.get(this.model.textureId);
    }

    hasStaging(uId)
    {
        return this.uStaging.has(uId);
    }

    isTextured()
    {
        return isSet(this.model.textureId);
    }

    async setModel(modelId)
    {
        if (!Model.isLoaded())
        {
            await Model.load();
        }

        this.model = Model.get(modelId);

        this.bindVao();
        Buffer.bind(this.model.bufferId);

        for (const [name, attribSize] of this.aLayout)
        {
            const pos = gl.getAttribLocation(this.glProgram, name);
            gl.enableVertexAttribArray(pos);
            gl.vertexAttribPointer(
                pos,
                attribSize,
                $.FLOAT,
                false,
                0,
                this.model.attributes.get(name)
            );
        }

        Buffer.unbind(this.model.bufferId);
        this.unbindVao();
    }

    setUniforms()
    {
        for (const [key, value] of this.uStaging)
        {
            this.uSetters.get(key)(value);
        }
    }

    stageUniform(key, value)
    {
        if (!Array.isArray(value)) throw value;

        this.uStaging.update(key, value);
    }

    stageUniformAtIndex(key, idx, value)
    {
        const staged = this.uStaging.get(key);

        if (!Array.isArray(staged) || staged.length <= idx) throw staged;

        staged[idx] = value;
    }

    unbindVao()
    {
        if (activeVao !== this.vao) throw activeVao;

        activeVao = null;
        gl.bindVertexArray(activeVao);
    }
}

let activeProgram;
let activeVao;

/*------------------------------------------------------------------------------
    Program creation
------------------------------------------------------------------------------*/
const createAttachShader = (program, shaderId, shaderDef) =>
{
    const shader = gl.createShader(shaderId);
    gl.shaderSource(shader, shaderDef.src);
    gl.compileShader(shader);
    gl.attachShader(program, shader);

    return shader;
};

const detachDeleteShader = (program, shader) =>
{
    gl.detachShader(program, shader);
    gl.deleteShader(shader);
};

/*------------------------------------------------------------------------------
    Uniform setter
------------------------------------------------------------------------------*/
const createUniSetter = (pos, loc) =>
{
    switch (pos)
    {
        case U_TYPE_2F:
            return (values) =>
            {
                if (values.length !== 2) throw values;
                gl.uniform2f(loc, ...values);
            };
        case U_TYPE_4F:
            return (values) =>
            {
                if (values.length !== 4) throw values;
                gl.uniform4f(loc, ...values);
            };
        case U_TYPE_M4FV:
            return (values) =>
            {
                if (values.length !== 2) throw values;
                if (!(values[1] instanceof Matrix)) throw values;
                gl.uniformMatrix4fv(loc, ...values);
            };
        default:
            throw pos;
    }
};

/*------------------------------------------------------------------------------
    Shader definition creation
------------------------------------------------------------------------------*/
class Shader
{
    constructor(src, uBlocks, uniforms)
    {
        this.src = src;
        this.uBlocks = uBlocks;
        this.uniforms = uniforms;
    }
}

class FShader extends Shader
{
    constructor(src, uBlocks, uniforms)
    {
        super(src, uBlocks, uniforms);
        Object.freeze(this);
    }
}

class VShader extends Shader
{
    constructor(src, layout, uBlocks, uniforms)
    {
        super(src, uBlocks, uniforms);
        this.layout = layout;
        Object.freeze(this);
    }
}

/*------------------------------------------------------------------------------
    Const
------------------------------------------------------------------------------*/
const VS_DEBUG = "VS_DEBUG";
const VS_UI = "VS_UI";
const VS_WORLD = "VS_WORLD";

const FS_DEBUG = "FS_DEBUG";
const FS_FXAA = "FS_IMAGE";
const FS_TEXTURED = "FS_TEX";

const U_TYPE_2F = "U_TYPE_2F";
const U_TYPE_4F = "U_TYPE_4F";
const U_TYPE_M4FV = "U_TYPE_M4FV";

/*------------------------------------------------------------------------------
    Vertex shader definitions
------------------------------------------------------------------------------*/
const vertDef = new SafeMap([
    [VS_DEBUG, new VShader(
        vsDebugSrc,
        new SafeMap([
            [$.A_POSITION, 3]
        ]),
        [$.UB_CAMERA]
    )],

    [VS_UI, new VShader(
        vsUiSrc,
        new SafeMap([
            [$.A_POSITION, 3],
            [$.A_TEXCOORD, 2]
        ]),
        null,
        new Map([
            [U_TYPE_M4FV, new SafeMap([
                [$.U_TRANSFORM, [0, 0]]
            ])]
        ])
    )],

    [VS_WORLD, new VShader(
        vsWorldSrc,
        new SafeMap([
            [$.A_POSITION, 3],
            [$.A_TEXCOORD, 2]
        ]),
        [$.UB_CAMERA],
        new Map([
            [U_TYPE_M4FV, new SafeMap([
                [$.U_TRANSFORM, [0, 0]]
            ])]
        ])
    )]
]);

/*------------------------------------------------------------------------------
    Fragment shader definitions
------------------------------------------------------------------------------*/
const fragDef = new SafeMap([
    [FS_DEBUG, new FShader(fsDebugSrc)],

    [FS_FXAA, new FShader(fsFxaaSrc)],

    [FS_TEXTURED, new FShader(
        fsTexturedSrc,
        null,
        new Map([
            [U_TYPE_4F, new SafeMap([
                [$.U_COLOR, [1, 1, 1, 1]]
            ])]
        ])
    )]
]);

/*------------------------------------------------------------------------------
    Program definitions
------------------------------------------------------------------------------*/
const programDef = [
    $.PRG_DEBUG, VS_DEBUG, FS_DEBUG,
    $.PRG_IMAGE, VS_UI,    FS_FXAA,
    $.PRG_UI,    VS_UI,    FS_TEXTURED,
    $.PRG_WORLD, VS_WORLD, FS_TEXTURED,
];

/*------------------------------------------------------------------------------
    Create and prepare programs
------------------------------------------------------------------------------*/
class PreparedProgram
{
    constructor(glProgram, aLayout, uBlocks, uDefaults, uSetters)
    {
        this.glProgram = glProgram;
        this.aLayout = aLayout;
        this.uBlocks = uBlocks;
        this.uDefaults = uDefaults;
        this.uSetters = uSetters;
        Object.freeze(this);
    }
}

const preparedPrograms = new SafeMap();
