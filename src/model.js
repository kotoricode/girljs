import { gl } from "./dom";
import { getSubTextureData, getTextureData } from "./texture";

import * as $ from "./const";

const BL_BR_TL_TR = (minX, maxX, minY, maxY) =>
{
    return [
        minX, minY,
        maxX, minY,
        minX, maxY,
        maxX, maxY,
    ];
};

const uvFromSubTexture = (subTextureId) =>
{
    const spriteData = getSubTextureData(subTextureId);
    const { x, y, width, height, baseTextureId } = spriteData;

    const baseData = getTextureData(baseTextureId);
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

const modelData = [
    $.MODEL_GROUND,
    {
        mesh: BL_BR_TL_TR(-500, 500, -500, 500),
        subTextureId: $.SUBTEXTURE_BG
    },

    $.MODEL_IMAGE,
    {
        mesh: BL_BR_TL_TR(-1, 1, -1, 1),
        uv: BL_BR_TL_TR(0, 1, 0, 1)
    },

    $.MODEL_PLAYER,
    {
        mesh: BL_BR_TL_TR(-40, 40, 0, 150),
        subTextureId: $.SUBTEXTURE_UKKO
    },

    $.MODEL_PLAYER2,
    {
        mesh: BL_BR_TL_TR(-40, 40, 0, 150),
        subTextureId: $.SUBTEXTURE_BRAID
    }
];

if (modelData.length % 2)
{
    throw Error;
}

const models = new Map(),
      numCoordinates = 8, // 4 verts, 2 coordunits
      modelSize = numCoordinates * 2, // mesh, uv
      numModels = modelData.length / 2,
      bufferData = new Array(modelSize * numModels),
      bytes = Float32Array.BYTES_PER_ELEMENT;

for (let i = 0; i < numModels; i++)
{
    const meshOffset = i * modelSize;
    const uvOffset = meshOffset + numCoordinates;

    let i2 = i * 2;
    const modelId = modelData[i2++];
    const { mesh, uv, subTextureId } = modelData[i2];

    const uvCoords = uv || uvFromSubTexture(subTextureId);

    models.set(modelId, {
        meshOffset: meshOffset * bytes,
        uvOffset: uvOffset * bytes,
        uvCoords,
        subTextureId
    });

    for (let j = 0; j < numCoordinates; j++)
    {
        bufferData[meshOffset+j] = mesh[j];
        bufferData[uvOffset+j] = uvCoords[j];
    }
}

const buffer = gl.createBuffer();

gl.bindBuffer($.ARRAY_BUFFER, buffer);

gl.bufferData(
    $.ARRAY_BUFFER,
    new Float32Array(bufferData),
    $.STATIC_DRAW
);

gl.bindBuffer($.ARRAY_BUFFER, null);

export const getModel = (modelId) =>
{
    if (!models.has(modelId))
    {
        throw modelId;
    }

    return models.get(modelId);
};

export const getModelBuffer = () =>
{
    return buffer;
};
