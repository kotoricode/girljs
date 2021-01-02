import { gl } from "./dom";

import * as ENUM_GL from "./enum-gl";
import * as CONST from "./const";

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

const modelData = new Map([
    [
        CONST.MODEL_GROUND,
        {
            mesh: [
                -500, -500,
                500, -500,
                500, 500,
                -500, 500,
            ],
            uv: [
                0, 1,
                1, 1,
                1, 0,
                0, 0,
            ],
            idx: [
                0, 1, 2,
                2, 3, 0
            ]
        },
    ],
    [
        CONST.MODEL_IMAGE,
        {
            mesh:[
                -1, -1,
                1, -1,
                1, 1,
                -1, 1
            ],
            uv: [
                0, 0,
                1, 0,
                1, 1,
                0, 1,
            ],
            idx: [
                0, 1, 2,
                2, 3, 0
            ]
        }
    ],
    [
        CONST.MODEL_PLAYER,
        {
            mesh: [
                -40, 0,
                40, 0,
                40, 150,
                -40, 150
            ],
            uv: [
                0, 1,
                1, 1,
                1, 0,
                0, 0,
            ],
            idx: [
                0, 1, 2,
                2, 3, 0
            ]
        }
    ],
]);

const models = new Map(),
      bufferData = [],
      bytes = Float32Array.BYTES_PER_ELEMENT;

for (const [id, { mesh, uv, idx }] of modelData)
{
    const idxLen = idx.length;

    const meshStart = bufferData.length,
          idxLen2 = idxLen * 2;

    const uvStart = meshStart + idxLen2;
    bufferData.length += idxLen2 * 2;

    models.set(id, {
        meshOffset: meshStart * bytes,
        uvOffset: uvStart * bytes,
        numVertices: idxLen,
        uvCoords: uv
    });

    for (let i = 0; i < idxLen2; i++)
    {
        const index = 2 * idx[i >> 1] + i % 2;

        bufferData[meshStart+i] = mesh[index];
        bufferData[uvStart+i] = uv[index];
    }
}

const buffer = gl.createBuffer();

gl.bindBuffer(ENUM_GL.ARRAY_BUFFER, buffer);

gl.bufferData(
    ENUM_GL.ARRAY_BUFFER,
    new Float32Array(bufferData),
    ENUM_GL.STATIC_DRAW
);

gl.bindBuffer(ENUM_GL.ARRAY_BUFFER, null);

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
