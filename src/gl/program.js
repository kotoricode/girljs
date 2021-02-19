import * as $ from "../const";
import { gl } from "../dom";
import { isSet, SafeMap, SafeSet } from "../utility";
import { Model } from "./model";
import { Buffer } from "./buffer";
import { Matrix } from "../math/matrix";
import { Texture } from "./texture";
import { Vao } from "./vao";

import vsDebugSrc  from "./shaders/vert/debug.vert";
import vsUiSrc     from "./shaders/vert/ui.vert";
import vsWorldSrc  from "./shaders/vert/world.vert";

import fsColorSrc    from "./shaders/frag/color.frag";
import fsLumaSrc     from "./shaders/frag/luma.frag";
import fsTexturedSrc from "./shaders/frag/textured.frag";

export class Program
{
    constructor(programId, modelId)
    {
        this.programId = programId;
        this.modelId = modelId;
        this.uStaging = new SafeMap();

        const { uDefaults } = this.getCompiled();

        for (const [name, values] of uDefaults)
        {
            this.uStaging.set(name, values.slice());
        }

        Vao.create(this);
        this.setModel(modelId);
        Object.seal(this);
    }

    static init()
    {
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
            constructor(src, aLayout, uBlocks, uniforms)
            {
                super(src, uBlocks, uniforms);
                this.aLayout = aLayout;
                Object.freeze(this);
            }
        }

        const VS_DEBUG = new VShader(
            vsDebugSrc,
            new SafeMap([
                [$.A_POSITION, 3]
            ]),
            [$.UB_CAMERA]
        );

        const VS_UI = new VShader(
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
        );

        const VS_WORLD = new VShader(
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
        );

        const FS_DEBUG = new FShader(fsColorSrc);
        const FS_LUMA = new FShader(fsLumaSrc);
        const FS_TEXTURED = new FShader(
            fsTexturedSrc,
            null,
            new Map([
                [U_TYPE_4F, new SafeMap([
                    [$.U_COLOR, [1, 1, 1, 1]]
                ])]
            ])
        );

        compiledPrograms.clear();

        compiledPrograms.set(
            $.PRG_DEBUG,
            new Compiled(VS_DEBUG, FS_DEBUG)
        );

        compiledPrograms.set(
            $.PRG_IMAGE,
            new Compiled(VS_UI, FS_LUMA)
        );

        compiledPrograms.set(
            $.PRG_UI,
            new Compiled(VS_UI, FS_TEXTURED)
        );

        compiledPrograms.set(
            $.PRG_WORLD,
            new Compiled(VS_WORLD, FS_TEXTURED)
        );
    }

    activate()
    {
        const { glProgram, uBlocks } = this.getCompiled();

        if (activeGlProgram !== glProgram)
        {
            activeGlProgram = glProgram;
            gl.useProgram(activeGlProgram);

            for (const blockId of uBlocks)
            {
                Buffer.setUniformBlockBinding(activeGlProgram, blockId);
            }
        }
    }

    getCompiled()
    {
        return compiledPrograms.get(this.programId);
    }

    getDynamicIndex()
    {
        const model = this.getModel();

        return Model.getDynamicIndex(model.indexId);
    }

    getDynamicMesh()
    {
        const model = this.getModel();

        return Model.getDynamicMesh(model.meshId);
    }

    getModel()
    {
        return Model.get(this.modelId);
    }

    getTexture()
    {
        const model = this.getModel();

        return Texture.get(model.textureId);
    }

    hasStagingUniform(uId)
    {
        return this.uStaging.has(uId);
    }

    isTextured()
    {
        const model = this.getModel();

        return isSet(model.textureId);
    }

    async setModel(modelId)
    {
        if (!Model.isLoaded())
        {
            await Model.load();
        }

        this.modelId = modelId;
        Vao.prepareModel(this);
    }

    setUniforms()
    {
        const { uSetters } = this.getCompiled();

        for (const [key, value] of this.uStaging)
        {
            uSetters.get(key)(value);
        }
    }

    stageUniform(key, value)
    {
        if (!Array.isArray(value)) throw value;

        this.uStaging.replace(key, value);
    }

    stageUniformIndexed(key, idx, value)
    {
        const staged = this.uStaging.get(key);

        if (!Array.isArray(staged) || staged.length <= idx) throw staged;

        staged[idx] = value;
    }
}

class Compiled
{
    constructor(vert, frag)
    {
        this.uBlocks = new SafeSet();
        this.uSetters = new SafeMap();
        this.uDefaults = new SafeMap();

        this.createGlProgram(vert, frag);

        for (const shader of [vert, frag])
        {
            this.createUniformBlocks(shader);
            this.createUniformSetters(shader);
        }

        this.aLayout = vert.aLayout;

        Object.freeze(this);
    }

    static createUniformSetterGl(type, location)
    {
        switch (type)
        {
            case U_TYPE_2F:
                return (values) =>
                {
                    if (values.length !== 2) throw values;
                    gl.uniform2f(location, ...values);
                };
            case U_TYPE_4F:
                return (values) =>
                {
                    if (values.length !== 4) throw values;
                    gl.uniform4f(location, ...values);
                };
            case U_TYPE_M4FV:
                return (values) =>
                {
                    if (values.length !== 2) throw values;
                    if (!(values[1] instanceof Matrix)) throw values;
                    gl.uniformMatrix4fv(location, ...values);
                };
            default:
                throw type;
        }
    }

    createAttachShader(shaderId, shaderDef)
    {
        const shader = gl.createShader(shaderId);
        gl.shaderSource(shader, shaderDef.src);
        gl.compileShader(shader);
        gl.attachShader(this.glProgram, shader);

        return shader;
    }

    createGlProgram(vert, frag)
    {
        this.glProgram = gl.createProgram();
        const vs = this.createAttachShader($.VERTEX_SHADER, vert);
        const fs = this.createAttachShader($.FRAGMENT_SHADER, frag);
        gl.linkProgram(this.glProgram);

        if (!gl.getProgramParameter(this.glProgram, $.LINK_STATUS))
        {
            console.log(gl.getError());
            throw this.glProgram;
        }

        this.detachDeleteShader(vs);
        this.detachDeleteShader(fs);
    }

    createUniformBlocks(shader)
    {
        if (shader.uBlocks)
        {
            for (const block of shader.uBlocks)
            {
                this.uBlocks.add(block);
            }
        }
    }

    createUniformSetters(shader)
    {
        if (shader.uniforms)
        {
            for (const [type, map] of shader.uniforms)
            {
                for (const [name, values] of map)
                {
                    const location = gl.getUniformLocation(
                        this.glProgram,
                        name
                    );

                    const setter = Compiled.createUniformSetterGl(
                        type,
                        location
                    );

                    this.uSetters.set(name, setter);
                    this.uDefaults.set(name, values);
                }
            }
        }
    }

    detachDeleteShader(shader)
    {
        gl.detachShader(this.glProgram, shader);
        gl.deleteShader(shader);
    }
}

const compiledPrograms = new SafeMap();
let activeGlProgram;

const U_TYPE_2F = "U_TYPE_2F";
const U_TYPE_4F = "U_TYPE_4F";
const U_TYPE_M4FV = "U_TYPE_M4FV";
