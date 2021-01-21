import * as $ from "../const";
import { gl } from "../dom";
import { SafeMap } from "../utility";

import vsScreen from "./shaders/vert/screen.vert";
import vsWorld  from "./shaders/vert/world.vert";
import vsUi     from "./shaders/vert/ui.vert";
import vsColor  from "./shaders/vert/color.vert";

import fsImageFx from "./shaders/frag/image-fx.frag";
import fsSprite  from "./shaders/frag/sprite.frag";
import fsPolygon from "./shaders/frag/polygon.frag";
import fsColor   from "./shaders/frag/color.frag";

const createAttachShader = (program, shaderId, vertFrag) =>
{
    const shader = gl.createShader(shaderId);
    gl.shaderSource(shader, vertFrag.src);
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
const attribXy = [$.A_XY, 2];
const attribUv = [$.A_UV, 2];

const uniTransform = [$.U_TRANSFORM, uniArrZeroZero];
const uniColor = [$.U_COLOR, [1, 1, 1, 1]];
const uniUvRepeat = [$.U_UVREPEAT, [1, 1]];
const uniUvOffset = [$.U_UVOFFSET, uniArrZeroZero];
const uniUvSize = [$.U_UVSIZE, uniArrZeroZero];

const attrMapXyzUv = new SafeMap([attribXyz, attribUv]);
const attrMapXyUv = new SafeMap([attribXy, attribUv]);
const uniMapColor = new SafeMap([uniColor]);

/*------------------------------------------------------------------------------
    Vertex shader definitions
------------------------------------------------------------------------------*/
const vertDef = {
    color: {
        src: vsColor,
        blocks: ubCamera,
        attributes: new SafeMap([attribXyz])
    },
    screen: {
        src: vsScreen,
        attributes: attrMapXyUv
    },
    ui: {
        src: vsUi,
        attributes: attrMapXyUv,
        uniforms: {
            uniformMatrix4fv: new SafeMap([uniTransform])
        }
    },
    world: {
        src: vsWorld,
        blocks: ubCamera,
        attributes: attrMapXyzUv,
        uniforms: {
            uniformMatrix4fv: new SafeMap([uniTransform]),
            uniform2f: new SafeMap([uniUvRepeat])
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
    imageFx: {
        src: fsImageFx
    },
    sprite: {
        src: fsSprite,
        uniforms: {
            uniform4f: uniMapColor
        }
    },
    polygon: {
        src: fsPolygon,
        uniforms: {
            uniform2f: new SafeMap([uniUvOffset, uniUvSize]),
            uniform4f: uniMapColor
        }
    }
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

    const { attributes, blocks: vsBlocks } = vert;
    const fsBlocks = frag.blocks;

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
    let blocks = null;

    if (vsBlocks)
    {
        blocks = [...vsBlocks];

        if (fsBlocks)
        {
            blocks.push(...fsBlocks);
        }
    }
    else if (fsBlocks)
    {
        blocks = [...fsBlocks];
    }

    /*--------------------------------------------------------------------------
        Uniforms
    --------------------------------------------------------------------------*/
    const setters = new SafeMap();
    const defaults = new SafeMap();

    for (const shader of [vert, frag])
    {
        if (shader.uniforms)
        {
            for (const [type, map] of Object.entries(shader.uniforms))
            {
                for (const [name, values] of map)
                {
                    const pos = gl.getUniformLocation(program, name);
                    const setter = createSetter(type, pos);
                    setters.set(name, setter);
                    defaults.set(name, values);
                }
            }
        }
    }

    preparedPrograms.set(programId, new SafeMap([
        [$.PROG_DATA_PROGRAM, program],
        [$.PROG_DATA_ATTRIBUTES, attributes],
        [$.PROG_DATA_BLOCKS, blocks],
        [$.PROG_DATA_DEFAULTS, defaults],
        [$.PROG_DATA_SETTERS, setters]
    ]));
}
