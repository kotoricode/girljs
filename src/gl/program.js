import * as $ from "../const";
import { gl } from "../dom";
import { isNullOrUndefined, SafeMap, SafeSet } from "../utility";
import { Model } from "./model";
import { Buffer } from "./buffer";
import { Matrix } from "../math/matrix";
import { Texture } from "./texture";

import vsColorSrc  from "./shaders/vert/color.vert";
import vsUiSrc     from "./shaders/vert/ui.vert";
import vsWorldSrc  from "./shaders/vert/world.vert";

import fsColorSrc from "./shaders/frag/color.frag";
import fsImageSrc from "./shaders/frag/image.frag";
import fsTexSrc   from "./shaders/frag/tex.frag";

export class Program
{
    constructor(programId, modelId)
    {
        const prepared = preparedPrograms.get(programId);

        // Program
        this.glProgram = prepared.get(DAT_PROGRAM);

        // Attributes
        this.aLayout = prepared.get(DAT_A_LAYOUT);
        this.vao = gl.createVertexArray();

        // Uniforms
        this.uSetters = prepared.get(DAT_U_SETTERS);
        this.uBlocks = prepared.get(DAT_U_BLOCKS);
        this.uStaging = new SafeMap();
        const uDefaults = prepared.get(DAT_U_DEFAULTS);

        for (const [name, values] of uDefaults)
        {
            this.uStaging.set(name, values.slice());
        }

        this.model = null;
        this.setModel(modelId);
        Object.seal(this);
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

    getMesh()
    {
        return Model.getMesh(this.model.meshId);
    }

    getTexture()
    {
        return Texture.get(this.model.textureId);
    }

    getUv()
    {
        return Model.getUv(this.model.uvId);
    }

    hasStaging(uId)
    {
        return this.uStaging.has(uId);
    }

    hasUniforms()
    {
        return this.uStaging.size > 0;
    }

    isTextured()
    {
        return !isNullOrUndefined(this.model.textureId);
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

const DAT_A_LAYOUT = "DAT_A_LAYOUT";
const DAT_PROGRAM = "DAT_PROGRAM";
const DAT_U_BLOCKS = "DAT_U_BLOCKS";
const DAT_U_DEFAULTS = "DAT_U_DEFAULTS";
const DAT_U_SETTERS = "DAT_U_SETTERS";

/*------------------------------------------------------------------------------
    Const
------------------------------------------------------------------------------*/
const VS_COLOR = "VS_COLOR";
const VS_UI = "VS_UI";
const VS_WORLD = "VS_WORLD";

const FS_COLOR = "FS_COLOR";
const FS_IMAGE = "FS_IMAGE";
const FS_TEX = "FS_TEX";

const U_TYPE_2F = "U_TYPE_2F";
const U_TYPE_4F = "U_TYPE_4F";
const U_TYPE_M4FV = "U_TYPE_M4FV";

/*------------------------------------------------------------------------------
    Vertex shader definitions
------------------------------------------------------------------------------*/
const vertDef = new SafeMap([
    [VS_COLOR, new VShader(
        vsColorSrc,
        new SafeMap([
            [$.A_XYZ, 3]
        ]),
        [$.UB_CAMERA]
    )],

    [VS_UI, new VShader(
        vsUiSrc,
        new SafeMap([
            [$.A_XYZ, 3],
            [$.A_UV, 2]
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
            [$.A_XYZ, 3],
            [$.A_UV, 2]
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
    [FS_COLOR, new FShader(fsColorSrc)],

    [FS_IMAGE, new FShader(fsImageSrc)],

    [FS_TEX, new FShader(
        fsTexSrc,
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
    $.PRG_COLOR,  VS_COLOR,  FS_COLOR,
    $.PRG_IMAGE,  VS_UI,     FS_IMAGE,
    $.PRG_WORLD,  VS_WORLD,  FS_TEX,
    $.PRG_UI,     VS_UI,     FS_TEX,
];

/*------------------------------------------------------------------------------
    Create and prepare programs
------------------------------------------------------------------------------*/
const preparedPrograms = new SafeMap();

for (let i = 0; i < programDef.length;)
{
    const programId = programDef[i++];
    const vert = vertDef.get(programDef[i++]);
    const frag = fragDef.get(programDef[i++]);

    const aLayout = vert.layout;

    /*--------------------------------------------------------------------------
        Program
    --------------------------------------------------------------------------*/
    const program = gl.createProgram();
    const vs = createAttachShader(program, $.VERTEX_SHADER, vert);
    const fs = createAttachShader(program, $.FRAGMENT_SHADER, frag);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, $.LINK_STATUS)) throw program;

    detachDeleteShader(program, vs);
    detachDeleteShader(program, fs);

    /*--------------------------------------------------------------------------
        Uniform blocks
    --------------------------------------------------------------------------*/
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

    /*--------------------------------------------------------------------------
        Uniforms
    --------------------------------------------------------------------------*/
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

    preparedPrograms.set(programId, new SafeMap([
        [DAT_PROGRAM, program],
        [DAT_A_LAYOUT, aLayout],
        [DAT_U_BLOCKS, uBlocks],
        [DAT_U_DEFAULTS, uDefaults],
        [DAT_U_SETTERS, uSetters]
    ]));
}
