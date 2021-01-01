import { gl } from "./dom";

import * as ENUM_GL from "./enum-gl";
import * as CONST from "./const";

const modelData = new Map([
    [
        CONST.MODEL_GROUND,
        {
            mesh: [
                -500, 500,
                -500, -500,
                500, -500,
                500, 500,
            ],
            uv: [
                0.21582, 0.37793,
                0.21582, 0.25293,
                0.34082, 0.25293,
                0.34082, 0.37793,
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
                1, 1,
                -1, -1,
                1, -1,
                -1, 1
            ],
            uv: [
                1, 1,
                0, 0,
                1, 0,
                0, 1
            ],
            idx: [
                3, 1, 0,
                0, 1, 2
            ]
        }
    ],
    [
        CONST.MODEL_PLAYER,
        {
            mesh: [
                21.148255814, 150,
                -21.148255814, 0,
                21.148255814, 0,
                -21.148255814, 150
            ],
            uv: [
                349, 0,
                252, 344,
                349, 344,
                252, 0
            ].map(x => x / 1024),
            idx: [
                0, 1, 2,
                0, 3, 1
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
