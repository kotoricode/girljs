import * as $ from "../const";
import { gl } from "../dom";

import vsStandard from "./shaders/standard.vert";
import vsView     from "./shaders/view.vert";
import vsColor    from "./shaders/color.vert";

import fsView    from "./shaders/view.frag";
import fsSprite  from "./shaders/sprite.frag";
import fsPolygon from "./shaders/polygon.frag";
import fsColor   from "./shaders/color.frag";

const createAttachShader = (program, shaderId, vertFrag) =>
{
    const shader = gl.createShader(shaderId);
    gl.shaderSource(shader, vertFrag.src);
    gl.compileShader(shader);
    gl.attachShader(program, shader);

    return shader;
};

const createUniSetter = (type, loc) => (values) =>
{
    gl[type](loc, ...values);
};

const detachDeleteShader = (program, shader) =>
{
    gl.detachShader(program, shader);
    gl.deleteShader(shader);
};

export const getPreparedProgram = (programId) =>
{
    if (preparedPrograms.has(programId))
    {
        return preparedPrograms.get(programId);
    }

    throw programId;
};

/*------------------------------------------------------------------------------
    Templates
------------------------------------------------------------------------------*/
const uniArrZeroZero = [0, 0];

const ubCamera = [$.UB_CAMERA];

const attribPos = {
    [$.A_XYZ]: 3
};

const attribPosUv = {
    [$.A_XYZ]: 3,
    [$.A_UV]: 2,
};

const uniTransVP = {
    [$.U_TRANSFORM]: uniArrZeroZero
};

const uniColor = {
    [$.U_COLOR]: [1, 1, 1, 1]
};

const uniUvRepeat = {
    [$.U_UVREPEAT]: [1, 1]
};

const uniUvOffsetSize = {
    [$.U_UVOFFSET]: uniArrZeroZero,
    [$.U_UVSIZE]: uniArrZeroZero
};

/*------------------------------------------------------------------------------
    Vertex shader definitions
------------------------------------------------------------------------------*/
const vertDef = {
    color: {
        src: vsColor,
        blocks: ubCamera,
        attributes: attribPos
    },
    view: {
        src: vsView,
        blocks: null,
        attributes: attribPosUv
    },
    sprite: {
        src: vsStandard,
        blocks: ubCamera,
        attributes: attribPosUv,
        uniforms: {
            uniformMatrix4fv: uniTransVP
        }
    },
    standard: {
        src: vsStandard,
        blocks: ubCamera,
        attributes: attribPosUv,
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
    color: {
        src: fsColor,
        blocks: null
    },
    view: {
        src: fsView,
        blocks: null
    },
    sprite: {
        src: fsSprite,
        blocks: null,
        uniforms: {
            uniform4f: uniColor
        }
    },
    polygon: {
        src: fsPolygon,
        blocks: null,
        uniforms: {
            uniform2f: uniUvOffsetSize,
            uniform4f: uniColor
        }
    }
};

/*------------------------------------------------------------------------------
    Program definitions
------------------------------------------------------------------------------*/
const programDef = [
    $.PROG_VIEW,    vertDef.view,     fragDef.view,
    $.PROG_SPRITE,  vertDef.standard, fragDef.sprite,
    $.PROG_POLYGON, vertDef.standard, fragDef.polygon,
    $.PROG_DEBUG,   vertDef.color,    fragDef.color
];

/*------------------------------------------------------------------------------
    Create and prepare programs
------------------------------------------------------------------------------*/
const preparedPrograms = new Map();

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

    if (!gl.getProgramParameter(program, $.LINK_STATUS))
    {
        throw gl.getProgramInfoLog(program);
    }

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
    const uniforms = {
        setters: new Map(),
        defaults: new Map(),
        staging: null,
        blocks
    };

    for (const shader of [vert, frag])
    {
        if (shader.uniforms)
        {
            for (const [type, typeObj] of Object.entries(shader.uniforms))
            {
                for (const [name, defValueArr] of Object.entries(typeObj))
                {
                    const pos = gl.getUniformLocation(program, name);
                    const uniSetter = createUniSetter(type, pos);
                    uniforms.setters.set(name, uniSetter);
                    uniforms.defaults.set(name, defValueArr);
                }
            }
        }
    }

    preparedPrograms.set(programId, {
        program,
        attributes,
        uniforms
    });
}
