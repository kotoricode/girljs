import { gl } from "./dom";

import * as $ from "./const";

/*
    3_________2
     |      /|
     |    /  |
     |  /    |
     |/______|
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

    idx: [
        0, 1, 2,
        2, 3, 0
    ]
*/

const createArray = (minX, maxX, minY, maxY) =>
{
    return [
        minX, minY,
        maxX, minY,
        maxX, maxY,
        minX, maxY
    ];
};

const createArrayFlipY = (minX, maxX, minY, maxY) =>
{
    return [
        minX, maxY,
        maxX, maxY,
        maxX, minY,
        minX, minY
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
      numVertices = 6,
      numCoordinates = numVertices * 2, // x, y
      modelSize = numCoordinates * 2, // mesh, uv
      bufferData = new Array(modelSize * modelDataNew.length / 3),
      bytes = Float32Array.BYTES_PER_ELEMENT,
      idx = [0, 1, 2, 2, 3, 0];

for (let i = 0; i < modelDataNew.length;)
{
    const id = modelDataNew[i++];
    const meshCoords = modelDataNew[i++];
    const uvCoords = modelDataNew[i++];

    const meshStart = i * modelSize;
    const uvStart = meshStart + numCoordinates;

    models.set(id, {
        meshOffset: meshStart * bytes,
        uvOffset: uvStart * bytes,
        uvCoords
    });

    for (let j = 0; j < numCoordinates; j++)
    {
        const coordIndex = 2 * idx[j >> 1] + j % 2;

        bufferData[meshStart+j] = meshCoords[coordIndex];
        bufferData[uvStart+j] = uvCoords[coordIndex];
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
