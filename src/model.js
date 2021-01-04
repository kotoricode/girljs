import { gl } from "./dom";

import * as $ from "./const";

/*
    2_________3
     |\      |
     |  \    |
     |    \  |
     |______\|
    0         1

    mesh: [
        minX, minY,
        maxX, minY,
        maxX, maxY,
        minX, maxY
    ]

    // image-based uv with flipped y (origin topleft instead of bottomleft)
    uv: [
        minX, maxY,
        maxX, maxY,
        maxX, minY,
        minX, minY
    ]
*/

const createArray = (minX, maxX, minY, maxY) =>
{
    return [
        minX, minY,
        maxX, minY,
        minX, maxY,
        maxX, maxY,
    ];
};

const createArrayFlipY = (minX, maxX, minY, maxY) =>
{
    return [
        minX, maxY,
        maxX, maxY,
        minX, minY,
        maxX, minY,
    ];
};

// name, meshCoords[], uvCoords[]
const modelDataNew = [
    $.MODEL_GROUND,
    createArray(-500, 500, -500, 500),
    createArrayFlipY(0, 1, 0, 1),

    $.MODEL_IMAGE,
    createArray(-1, 1, -1, 1),
    createArray(0, 1, 0, 1),

    $.MODEL_PLAYER,
    createArray(-40, 40, 0, 150),
    createArrayFlipY(0, 1, 0, 1)
];

if (modelDataNew.length % 3)
{
    throw Error;
}

const models = new Map(),
      idx = [0, 1, 2, 3],
      numCoordinates = idx.length * 2, // x, y
      modelSize = numCoordinates * 2, // mesh, uv
      numModels = modelDataNew.length / 3,
      bufferData = new Array(modelSize * numModels),
      bytes = Float32Array.BYTES_PER_ELEMENT;

for (let i = 0; i < numModels; i++)
{
    const meshOffset = i * modelSize;
    let i3 = i * 3;

    const uvOffset = meshOffset + numCoordinates;

    const id = modelDataNew[i3++];
    const meshCoords = modelDataNew[i3++];
    const uvCoords = modelDataNew[i3];

    models.set(id, {
        meshOffset: meshOffset * bytes,
        uvOffset: uvOffset * bytes,
        uvCoords
    });

    for (let j = 0; j < numCoordinates; j++)
    {
        const coordIndex = 2 * idx[j >> 1] + j % 2;

        bufferData[meshOffset+j] = meshCoords[coordIndex];
        bufferData[uvOffset+j] = uvCoords[coordIndex];
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
