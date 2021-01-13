import * as $ from "../const";
import { BufferData } from "../buffer-data";
import { BufferArray } from "./buffer";
import { Texture } from "./texture";

const getXy = (minX, maxX, minY, maxY) =>
{
    return [
        minX, minY, 0,
        maxX, minY, 0,
        minX, maxY, 0,
        maxX, maxY, 0,
    ];
};

const getXz = (minX, maxX, minZ, maxZ) =>
{
    return [
        minX, 0, maxZ,
        maxX, 0, maxZ,
        minX, 0, minZ,
        maxX, 0, minZ,
    ];
};

export const getModel = (modelId) =>
{
    if (models.has(modelId))
    {
        return models.get(modelId);
    }

    throw modelId;
};

const uvFromSubTexture = (modelId) =>
{
    const {
        x, y, width, height, baseData
    } = Texture.getSubTextureData(modelId);

    const minX = x / baseData.width;
    const maxX = (x + width) / baseData.width;
    const minY = y / baseData.height;
    const maxY = (y + height) / baseData.height;

    return [
        minX, maxY,
        maxX, maxY,
        minX, minY,
        maxX, minY,
    ];
};

/*------------------------------------------------------------------------------
    General
------------------------------------------------------------------------------*/
const models = new Map();
const bytes = Float32Array.BYTES_PER_ELEMENT;

/*------------------------------------------------------------------------------
    Sprites
------------------------------------------------------------------------------*/
const spriteModelData = [
    $.MODEL_GROUND,   getXz(-2, 2, -2, 2),
    $.MODEL_PLAYER,   getXy(-0.4, 0.4, 0, 1.5),
    $.MODEL_BRAID_00, getXy(-0.4, 0.4, 0, 1.5),
    $.MODEL_BRAID_01, getXy(-0.4, 0.4, 0, 1.5),
    $.MODEL_BRAID_02, getXy(-0.4, 0.4, 0, 1.5),
    $.MODEL_BRAID_03, getXy(-0.4, 0.4, 0, 1.5),
    $.MODEL_BRAID_04, getXy(-0.4, 0.4, 0, 1.5),
    $.MODEL_BRAID_05, getXy(-0.4, 0.4, 0, 1.5),
    $.MODEL_BRAID_06, getXy(-0.4, 0.4, 0, 1.5),
    $.MODEL_BRAID_07, getXy(-0.4, 0.4, 0, 1.5),
    $.MODEL_BRAID_08, getXy(-0.4, 0.4, 0, 1.5),
    $.MODEL_BRAID_09, getXy(-0.4, 0.4, 0, 1.5),
    $.MODEL_BRAID_10, getXy(-0.4, 0.4, 0, 1.5),
    $.MODEL_BRAID_11, getXy(-0.4, 0.4, 0, 1.5),
    $.MODEL_BRAID_12, getXy(-0.4, 0.4, 0, 1.5),
    $.MODEL_BRAID_13, getXy(-0.4, 0.4, 0, 1.5),
    $.MODEL_BRAID_14, getXy(-0.4, 0.4, 0, 1.5),
    $.MODEL_BRAID_15, getXy(-0.4, 0.4, 0, 1.5),
    $.MODEL_BRAID_16, getXy(-0.4, 0.4, 0, 1.5),
    $.MODEL_BRAID_17, getXy(-0.4, 0.4, 0, 1.5),
    $.MODEL_BRAID_18, getXy(-0.4, 0.4, 0, 1.5),
    $.MODEL_BRAID_19, getXy(-0.4, 0.4, 0, 1.5),
    $.MODEL_BRAID_20, getXy(-0.4, 0.4, 0, 1.5),
    $.MODEL_BRAID_21, getXy(-0.4, 0.4, 0, 1.5),
    $.MODEL_BRAID_22, getXy(-0.4, 0.4, 0, 1.5),
    $.MODEL_BRAID_23, getXy(-0.4, 0.4, 0, 1.5),
    $.MODEL_BRAID_24, getXy(-0.4, 0.4, 0, 1.5),
    $.MODEL_BRAID_25, getXy(-0.4, 0.4, 0, 1.5),
    $.MODEL_BRAID_26, getXy(-0.4, 0.4, 0, 1.5),
];

const xyzSize = 12;
const uvSize = 8;
const xyzUvSize = xyzSize + uvSize;
const spriteBufferData = new Array(xyzUvSize * spriteModelData.length / 2);

for (let i = 0; i < spriteModelData.length;)
{
    const meshOffset = (i / 3) * xyzUvSize;

    const modelId = spriteModelData[i++];
    const mesh = spriteModelData[i++];

    const uvOffset = meshOffset + xyzSize;
    const uvCoords = uvFromSubTexture(modelId);

    models.set(modelId, {
        meshOffset: meshOffset * bytes,
        uvOffset: uvOffset * bytes,
        uvCoords,
        modelId
    });

    for (let j = 0; j < xyzSize; j++)
    {
        spriteBufferData[meshOffset+j] = mesh[j];
    }

    for (let j = 0; j < uvSize; j++)
    {
        spriteBufferData[uvOffset+j] = uvCoords[j];
    }
}

BufferArray.set(
    $.BUF_ARR_SPRITE,
    new BufferData(spriteBufferData),
    $.STATIC_DRAW
);

/*------------------------------------------------------------------------------
    Polygons
------------------------------------------------------------------------------*/
const polygonModelData = [
    $.MODEL_IMAGE,
    [ -1, 1, 0, -1, -1, 0, 1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0 ],
    [ 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1 ]
];

const polygonBufferData = [];

for (let i = 0; i < polygonModelData.length;)
{
    const modelId = polygonModelData[i++];
    const mesh = polygonModelData[i++];
    const uvCoords = polygonModelData[i++];

    const meshOffset = polygonBufferData.length;
    polygonBufferData.length += mesh.length + uvCoords.length;

    const uvOffset = meshOffset + mesh.length;

    models.set(modelId, {
        meshOffset: meshOffset * bytes,
        uvOffset: uvOffset * bytes,
        uvCoords
    });

    for (let j = 0; j < mesh.length; j++)
    {
        polygonBufferData[meshOffset+j] = mesh[j];
    }

    for (let j = 0; j < uvCoords.length; j++)
    {
        polygonBufferData[uvOffset+j] = uvCoords[j];
    }
}

BufferArray.set(
    $.BUF_ARR_POLYGON,
    new BufferData(polygonBufferData),
    $.STATIC_DRAW
);
