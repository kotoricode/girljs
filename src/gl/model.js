import * as $ from "../const";
import { setBufferData } from "./buffer";
import { getSubTextureData } from "./texture";

const getCoords = (minX, maxX, minY, maxY) =>
{
    return [
        minX, minY, 0,
        maxX, minY, 0,
        minX, maxY, 0,
        maxX, maxY, 0,
    ];
};

const getUv = (minX, maxX, minY, maxY) =>
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

    $.MODEL_IMAGE,   getCoords(-1, 1, -1, 1),         getUv(0, 1, 0, 1)
];

const models = new Map(),
      modelSize = 12 + 8,
      numModels = modelData.length / 3,
      bufferData = new Array(modelSize * numModels),
      bytes = Float32Array.BYTES_PER_ELEMENT;

for (let i = 0; i < modelData.length;)
{
    const meshOffset = (i / 3) * modelSize;

    const modelId = modelData[i++];
    const mesh = modelData[i++];
    const subTexOrUv = modelData[i++];
    const hasRawUv = Array.isArray(subTexOrUv);

    const uvOffset = meshOffset + 12;

    const uvCoords = hasRawUv ? subTexOrUv : uvFromSubTexture(subTexOrUv);

    models.set(modelId, {
        meshOffset: meshOffset * bytes,
        uvOffset: uvOffset * bytes,
        uvCoords,
        subTextureId: hasRawUv ? null : subTexOrUv
    });

    for (let j = 0; j < 12; j++)
    {
        bufferData[meshOffset+j] = mesh[j];
    }

    for (let j = 0; j < 8; j++)
    {
        bufferData[uvOffset+j] = uvCoords[j];
    }
}

setBufferData($.BUFFER_MODEL, bufferData);
