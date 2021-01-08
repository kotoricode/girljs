import * as $ from "../const";
import { gl } from "../dom";
import { bindBuffer, unbindBuffer } from "./buffer";
import { getSubTextureData } from "./texture";

const getCoords = (minX, maxX, minY, maxY) =>
{
    return [
        minX, minY,
        maxX, minY,
        minX, maxY,
        maxX, maxY,
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

const modelData = [
    $.MODEL_GROUND,  getCoords(-200, 200, -200, 200), $.SUBTEXTURE_BG,
    $.MODEL_PLAYER,  getCoords(-40, 40, 0, 150),      $.SUBTEXTURE_UKKO,
    $.MODEL_PLAYER2, getCoords(-40, 40, 0, 150),      $.SUBTEXTURE_BRAID,

    $.MODEL_IMAGE,   getCoords(-1, 1, -1, 1),         getCoords(0, 1, 0, 1)
];

const models = new Map(),
      numCoordUnits = 8, // 4 verts, 2 xy
      modelSize = numCoordUnits * 2, // mesh, uv
      numModels = modelData.length / 2,
      bufferData = new Array(modelSize * numModels),
      bytes = Float32Array.BYTES_PER_ELEMENT;

for (let i = 0; i < modelData.length;)
{
    const modelId = modelData[i++];
    const mesh = modelData[i++];
    const subTexOrUv = modelData[i++];
    const hasSubTexture = typeof subTexOrUv === "string";

    const meshOffset = (i / 3) * modelSize;
    const uvOffset = meshOffset + numCoordUnits;

    const uvCoords = hasSubTexture
                   ? uvFromSubTexture(subTexOrUv)
                   : subTexOrUv;

    models.set(modelId, {
        meshOffset: meshOffset * bytes,
        uvOffset: uvOffset * bytes,
        uvCoords,
        subTextureId: hasSubTexture ? subTexOrUv : null
    });

    for (let j = 0; j < numCoordUnits; j++)
    {
        bufferData[meshOffset+j] = mesh[j];
        bufferData[uvOffset+j] = uvCoords[j];
    }
}

bindBuffer($.BUFFER_MODEL);
gl.bufferData($.ARRAY_BUFFER, new Float32Array(bufferData), $.STATIC_DRAW);
unbindBuffer();
