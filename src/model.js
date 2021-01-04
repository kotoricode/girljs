import { gl } from "./dom";

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

const TL_TR_BL_BR = (minX, maxX, minY, maxY) =>
{
    return [
        minX, maxY,
        maxX, maxY,
        minX, minY,
        maxX, minY,
    ];
};

// name, meshCoords[], uvCoords[]
const modelData = [
    $.MODEL_GROUND,
    BL_BR_TL_TR(-500, 500, -500, 500),
    TL_TR_BL_BR(0, 1, 0, 1),

    $.MODEL_IMAGE,
    BL_BR_TL_TR(-1, 1, -1, 1),
    BL_BR_TL_TR(0, 1, 0, 1),

    $.MODEL_PLAYER,
    BL_BR_TL_TR(-40, 40, 0, 150),
    TL_TR_BL_BR(0, 1, 0, 1),

    $.MODEL_PLAYER2,
    BL_BR_TL_TR(-40, 40, 0, 150),
    TL_TR_BL_BR(0, 0.5, 0, 0.5)
];

if (modelData.length % 3)
{
    throw Error;
}

const models = new Map(),
      numCoordinates = 8, // 4 verts, 2 coordunits
      modelSize = numCoordinates * 2, // mesh, uv
      numModels = modelData.length / 3,
      bufferData = new Array(modelSize * numModels),
      bytes = Float32Array.BYTES_PER_ELEMENT;

for (let i = 0; i < numModels; i++)
{
    const meshOffset = i * modelSize;
    let i3 = i * 3;

    const uvOffset = meshOffset + numCoordinates;

    const modelId = modelData[i3++];
    const meshCoords = modelData[i3++];
    const uvCoords = modelData[i3];

    models.set(modelId, {
        meshOffset: meshOffset * bytes,
        uvOffset: uvOffset * bytes,
        uvCoords
    });

    for (let j = 0; j < numCoordinates; j++)
    {
        bufferData[meshOffset+j] = meshCoords[j];
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
