import * as $ from "../const";
import { gl } from "../dom";
import { SafeMap, SafeSet } from "../utility";

import vsScreen from "./shaders/vert/screen.vert";
import vsWorld  from "./shaders/vert/world.vert";
import vsUi     from "./shaders/vert/ui.vert";
import vsColor  from "./shaders/vert/color.vert";

import fsImageFx from "./shaders/frag/image-fx.frag";
import fsSprite  from "./shaders/frag/sprite.frag";
import fsPolygon from "./shaders/frag/polygon.frag";
import fsColor   from "./shaders/frag/color.frag";

const createAttachShader = (program, shaderId, shaderDef) =>
{
    const shader = gl.createShader(shaderId);
    gl.shaderSource(shader, shaderDef.get($.PROG_DEF_SRC));
    gl.compileShader(shader);
    gl.attachShader(program, shader);

    return shader;
};

const createSetter = (type, loc) => (values) => gl[type](loc, ...values);

const detachDeleteShader = (program, shader) =>
{
    gl.detachShader(program, shader);
    gl.deleteShader(shader);
};

export const Program = {
    getPrepared(programId)
    {
        return preparedPrograms.get(programId);
    }
};

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
const attrMapXyUv = new SafeMap([attribXyz, attribUv]);
const uniMapColor = new SafeMap([uniColor]);

/*------------------------------------------------------------------------------
    Vertex shader definitions
------------------------------------------------------------------------------*/
const vertDef = {

    color: new SafeMap([
        [$.PROG_DEF_SRC, vsColor],
        [$.PROG_DEF_A_LAYOUT, new SafeMap([attribXyz])],
        [$.PROG_DEF_U_BLOCKS, ubCamera],
    ]),

    screen: new SafeMap([
        [$.PROG_DEF_SRC, vsScreen],
        [$.PROG_DEF_A_LAYOUT, attrMapXyUv]
    ]),


    ui: new SafeMap([
        [$.PROG_DEF_SRC, vsUi],
        [$.PROG_DEF_A_LAYOUT, attrMapXyUv],
        [$.PROG_DEF_U, new SafeMap([
            [$.U_TYPE_M4FV, new SafeMap([uniTransform])]
        ])]
    ]),

    world: new SafeMap([
        [$.PROG_DEF_SRC, vsWorld],
        [$.PROG_DEF_A_LAYOUT, attrMapXyzUv],
        [$.PROG_DEF_U_BLOCKS, ubCamera],
        [$.PROG_DEF_U, new SafeMap([
            [$.U_TYPE_M4FV, new SafeMap([uniTransform])],
            [$.U_TYPE_2F, new SafeMap([uniUvRepeat])]
        ])]
    ])

};

/*------------------------------------------------------------------------------
    Fragment shader definitions
------------------------------------------------------------------------------*/
const fragDef = {

    color: new SafeMap([
        [$.PROG_DEF_SRC, fsColor]
    ]),

    imageFx: new SafeMap([
        [$.PROG_DEF_SRC, fsImageFx]
    ]),

    sprite: new SafeMap([
        [$.PROG_DEF_SRC, fsSprite],
        [$.PROG_DEF_U, new SafeMap([
            [$.U_TYPE_4F, uniMapColor]
        ])]
    ]),

    polygon: new SafeMap([
        [$.PROG_DEF_SRC, fsPolygon],
        [$.PROG_DEF_U, new SafeMap([
            [$.U_TYPE_2F, new SafeMap([uniUvOffset, uniUvSize])],
            [$.U_TYPE_4F, uniMapColor]
        ])]
    ]),

};

/*------------------------------------------------------------------------------
    Program definitions
------------------------------------------------------------------------------*/
const programDef = [
    $.PROG_SCREEN,   vertDef.screen, fragDef.sprite,
    $.PROG_UI,       vertDef.ui,     fragDef.sprite,
    $.PROG_IMAGE_FX, vertDef.screen, fragDef.imageFx,
    $.PROG_SPRITE,   vertDef.world,  fragDef.sprite,
    $.PROG_POLYGON,  vertDef.world,  fragDef.polygon,
    $.PROG_DEBUG,    vertDef.color,  fragDef.color
];

/*------------------------------------------------------------------------------
    Create and prepare programs
------------------------------------------------------------------------------*/
const preparedPrograms = new SafeMap();

for (let i = 0; i < programDef.length;)
{
    const programId = programDef[i++];
    const vert = programDef[i++];
    const frag = programDef[i++];

    const aLayout = vert.get($.PROG_DEF_A_LAYOUT);

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

    if (vert.has($.PROG_DEF_U_BLOCKS))
    {
        for (const block of vert.get($.PROG_DEF_U_BLOCKS))
        {
            uBlocks.add(block);
        }
    }

    if (frag.has($.PROG_DEF_U_BLOCKS))
    {
        for (const block of frag.has($.PROG_DEF_U_BLOCKS))
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
        if (shader.has($.PROG_DEF_U))
        {
            for (const [type, map] of shader.get($.PROG_DEF_U))
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
        [$.PROG_DATA_PROGRAM, program],
        [$.PROG_DATA_A_LAYOUT, aLayout],
        [$.PROG_DATA_U_BLOCKS, uBlocks],
        [$.PROG_DATA_U_DEFAULTS, uDefaults],
        [$.PROG_DATA_U_SETTERS, uSetters]
    ]));
}
