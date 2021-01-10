import * as $ from "../const";
import { setBufferData } from "./gl-helper";
import { getSubTextureData } from "./texture";

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

const uvFromSubTexture = (subTextureId) =>
{
    const { x, y, width, height, baseData } = getSubTextureData(subTextureId);
    const { width: baseWidth, height: baseHeight } = baseData;

    const minX = x / baseWidth,
          maxX = (x + width) / baseWidth,
          minY = y / baseHeight,
          maxY = (y + height) / baseHeight;

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
    $.MODEL_GROUND,  getXz(-2, 2, -2, 2),      $.SUBTEXTURE_BG,
    $.MODEL_PLAYER,  getXy(-0.4, 0.4, 0, 1.5), $.SUBTEXTURE_UKKO,
    $.MODEL_PLAYER2, getXy(-0.4, 0.4, 0, 1.5), $.SUBTEXTURE_BRAID,
];

const xyzSize = 12,
      uvSize = 8,
      xyzUvSize = xyzSize + uvSize,
      spriteBufferData = new Array(xyzUvSize * spriteModelData.length / 3);

for (let i = 0; i < spriteModelData.length;)
{
    const meshOffset = (i / 3) * xyzUvSize;

    const modelId = spriteModelData[i++];
    const mesh = spriteModelData[i++];
    const subTextureId = spriteModelData[i++];

    const uvOffset = meshOffset + xyzSize;
    const uvCoords = uvFromSubTexture(subTextureId);

    models.set(modelId, {
        meshOffset: meshOffset * bytes,
        uvOffset: uvOffset * bytes,
        uvCoords,
        subTextureId
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

setBufferData($.BUFFER_SPRITE, spriteBufferData, $.STATIC_DRAW);

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

setBufferData($.BUFFER_POLYGON, polygonBufferData, $.STATIC_DRAW);
