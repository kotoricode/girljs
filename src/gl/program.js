import * as $ from "../const";
import { gl } from "../dom";
import { SafeMap, SafeSet } from "../utility";
import { Model } from "./model";
import { VertexArray } from "./vertex-array";
import { Buffer } from "./buffer";

import vsScreenSrc from "./shaders/vert/screen.vert";
import vsWorldSrc  from "./shaders/vert/world.vert";
import vsUiSrc     from "./shaders/vert/ui.vert";
import vsColorSrc  from "./shaders/vert/color.vert";

import fsImageSrc    from "./shaders/frag/image.frag";
import fsTexSrc       from "./shaders/frag/tex.frag";
import fsTexRectRepeatSrc from "./shaders/frag/tex-rect-repeat.frag";
import fsColorSrc    from "./shaders/frag/color.frag";

export class Program
{
    constructor(programId, modelId)
    {
        const prepared = preparedPrograms.get(programId);

        // Program
        this.glProgram = prepared.get($.DAT_PROGRAM);

        // Attributes
        this.aLayout = prepared.get($.DAT_A_LAYOUT);
        this.vao = gl.createVertexArray();
        this.setModel(modelId);

        // Uniforms
        this.uSetters = prepared.get($.DAT_U_SETTERS);
        this.uBlocks = prepared.get($.DAT_U_BLOCKS);
        this.uStaging = new SafeMap();
        const uDefaults = prepared.get($.DAT_U_DEFAULTS);

        for (const [name, values] of uDefaults)
        {
            this.uStaging.set(name, values.slice());
        }
    }

    delete()
    {
        gl.deleteVertexArray(this.vao);
    }

    hasStaging(uId)
    {
        return this.uStaging.has(uId);
    }

    setModel(modelId)
    {
        this.modelId = modelId;
        const attributes = Model.getAttributes(modelId);
        const bufferId = Model.getBufferId(modelId);

        VertexArray.bind(this.vao);
        Buffer.bind(bufferId);

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
                attributes.get(name)
            );
        }

        Buffer.unbind(bufferId);
        VertexArray.unbind();
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
        if (!Array.isArray(value)) throw Error;

        this.uStaging.update(key, value);
    }

    stageUniformAtIndex(key, idx, value)
    {
        const staged = this.uStaging.get(key);

        if (!Array.isArray(staged) || staged.length <= idx) throw Error;

        staged[idx] = value;
    }
}

const createAttachShader = (program, shaderId, shaderDef) =>
{
    const shader = gl.createShader(shaderId);
    gl.shaderSource(shader, shaderDef.get(PROG_DEF_SRC));
    gl.compileShader(shader);
    gl.attachShader(program, shader);

    return shader;
};

// TODO: setters for each type so we don't have to look it up all the time
// TODO: verify that values correspond to the setter's expected datatype
const createSetter = (type, loc) => (values) => gl[type](loc, ...values);

const detachDeleteShader = (program, shader) =>
{
    gl.detachShader(program, shader);
    gl.deleteShader(shader);
};

/*------------------------------------------------------------------------------
    Shader definition creation
------------------------------------------------------------------------------*/
const setUniformData = (map, uData) =>
{
    if (uData)
    {
        const uMap = new SafeMap();

        for (let i = 0; i < uData.length;)
        {
            uMap.set(uData[i++], uData[i++]);
        }

        map.set(PROG_DEF_U, uMap);
    }
};

const createVertDef = (id, src, layout, uBlocks, ...uData) =>
{
    const map = new SafeMap([
        [PROG_DEF_SRC, src],
        [PROG_DEF_A_LAYOUT, layout]
    ]);

    if (uBlocks)
    {
        map.set(PROG_DEF_U_BLOCKS, uBlocks);
    }

    setUniformData(map, uData);

    return [id, map];
};

const createFragDef = (id, src, ...uData) =>
{
    const map = new SafeMap([[PROG_DEF_SRC, src]]);
    setUniformData(map, uData);

    return [id, map];
};

/*------------------------------------------------------------------------------
    Const
------------------------------------------------------------------------------*/
const PROG_DEF_SRC = 0;
const PROG_DEF_A_LAYOUT = 1;
const PROG_DEF_U = 2;
const PROG_DEF_U_BLOCKS = 3;

const VS_COLOR = 0;
const VS_SCREEN = 1;
const VS_UI = 2;
const VS_WORLD = 3;

const FS_COLOR = 0;
const FS_IMAGE = 1;
const FS_TEX_RECT_REPEAT = 2;
const FS_TEX = 3;

const U_TYPE_2F = "uniform2f";
const U_TYPE_4F = "uniform4f";
const U_TYPE_M4FV = "uniformMatrix4fv";

/*------------------------------------------------------------------------------
    Templates
------------------------------------------------------------------------------*/
const uniArrZeroZero = [0, 0];

const ubCamera = [$.UB_CAMERA];

const attribXyz = [$.A_XYZ, 3];
const attribUv = [$.A_UV, 2];

const uniTransform = [$.U_TRANSFORM, uniArrZeroZero];
const uniColor = [$.U_COLOR, [1, 1, 1, 1]];
const uniUvRepeat = [$.U_UVREPEAT, [1, 1]];
const uniUvOffset = [$.U_UVOFFSET, uniArrZeroZero];
const uniUvSize = [$.U_UVSIZE, uniArrZeroZero];

const attrMapXyzUv = new SafeMap([attribXyz, attribUv]);
const uniMapColor = new SafeMap([uniColor]);

/*------------------------------------------------------------------------------
    Vertex shader definitions
------------------------------------------------------------------------------*/
const vertDef = new SafeMap([
    createVertDef(VS_COLOR, vsColorSrc, new SafeMap([attribXyz]), ubCamera),
    createVertDef(VS_SCREEN, vsScreenSrc, attrMapXyzUv),
    createVertDef(VS_UI, vsUiSrc, attrMapXyzUv, null,
        U_TYPE_M4FV, new SafeMap([uniTransform])
    ),
    createVertDef(VS_WORLD, vsWorldSrc, attrMapXyzUv, ubCamera,
        U_TYPE_M4FV, new SafeMap([uniTransform]),
        U_TYPE_2F, new SafeMap([uniUvRepeat])
    )
]);

/*------------------------------------------------------------------------------
    Fragment shader definitions
------------------------------------------------------------------------------*/
const fragDef = new SafeMap([
    createFragDef(FS_COLOR, fsColorSrc),
    createFragDef(FS_IMAGE, fsImageSrc),
    createFragDef(FS_TEX_RECT_REPEAT, fsTexRectRepeatSrc,
        U_TYPE_2F, new SafeMap([uniUvOffset, uniUvSize]),
        U_TYPE_4F, uniMapColor
    ),
    createFragDef(FS_TEX, fsTexSrc,
        U_TYPE_4F, uniMapColor
    )
]);

/*------------------------------------------------------------------------------
    Program definitions
------------------------------------------------------------------------------*/
const programDef = [
    $.PRO_COLOR,   VS_COLOR,  FS_COLOR,
    $.PRO_IMAGE,   VS_SCREEN, FS_IMAGE,
    $.PRO_REPEAT,  VS_WORLD,  FS_TEX_RECT_REPEAT,
    $.PRO_SCREEN,  VS_SCREEN, FS_TEX,
    $.PRO_SPRITE,  VS_WORLD,  FS_TEX,
    $.PRO_UI,      VS_UI,     FS_TEX,
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

    const aLayout = vert.get(PROG_DEF_A_LAYOUT);

    /*--------------------------------------------------------------------------
        Program
    --------------------------------------------------------------------------*/
    const program = gl.createProgram();
    const vs = createAttachShader(program, $.VERTEX_SHADER, vert);
    const fs = createAttachShader(program, $.FRAGMENT_SHADER, frag);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, $.LINK_STATUS)) throw Error;

    detachDeleteShader(program, vs);
    detachDeleteShader(program, fs);

    /*--------------------------------------------------------------------------
        Uniform blocks
    --------------------------------------------------------------------------*/
    const uBlocks = new SafeSet();

    if (vert.has(PROG_DEF_U_BLOCKS))
    {
        for (const block of vert.get(PROG_DEF_U_BLOCKS))
        {
            uBlocks.add(block);
        }
    }

    if (frag.has(PROG_DEF_U_BLOCKS))
    {
        for (const block of frag.has(PROG_DEF_U_BLOCKS))
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
        if (shader.has(PROG_DEF_U))
        {
            for (const [type, map] of shader.get(PROG_DEF_U))
            {
                for (const [name, values] of map)
                {
                    const pos = gl.getUniformLocation(program, name);
                    const setter = createSetter(type, pos);
                    uSetters.set(name, setter);
                    uDefaults.set(name, values);
                }
            }
        }
    }

    preparedPrograms.set(programId, new SafeMap([
        [$.DAT_PROGRAM, program],
        [$.DAT_A_LAYOUT, aLayout],
        [$.DAT_U_BLOCKS, uBlocks],
        [$.DAT_U_DEFAULTS, uDefaults],
        [$.DAT_U_SETTERS, uSetters]
    ]));
}
