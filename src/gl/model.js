import * as $ from "../const";
import { BufferData } from "../buffer-data";
import { BufferArray } from "./buffer";
import { Texture, subTextureData } from "./texture";

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

const uvFromSubTexture = (subTex) =>
{
    const {
        x, y, width, height, baseData
    } = Texture.getSubTextureData(subTex);

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
const bytes = Float32Array.BYTES_PER_ELEMENT;

const spriteBufferData = [];
const xyOffsets = new Map();
const uvOffsets = new Map();
const uvCoords = new Map();
const models = new Map();

const meshData = [
    $.MESH_GROUND, getXz(-2, 2, -2, 2),
    $.MESH_PLAYER, getXy(-0.4, 0.4, 0, 1.5),
];

for (let i = 0; i < meshData.length;)
{
    const id = meshData[i++];
    const coords = meshData[i++];

    const xyOffset = spriteBufferData.length * bytes;
    xyOffsets.set(id, xyOffset);
    spriteBufferData.push(...coords);
}

for (const subTexId of subTextureData.keys())
{
    const coords = uvFromSubTexture(subTexId);
    const uvOffset = spriteBufferData.length * bytes;
    uvOffsets.set(subTexId, uvOffset);
    uvCoords.set(subTexId, coords);
    spriteBufferData.push(...coords);
}

const modelData = [
    $.MODEL_GROUND,   $.MESH_GROUND, $.SUBTEX_GROUND,
    $.MODEL_PLAYER,   $.MESH_PLAYER, $.SUBTEX_PLAYER,
    $.MODEL_BRAID_00, $.MESH_PLAYER, $.SUBTEX_BRAID_00,
    $.MODEL_BRAID_01, $.MESH_PLAYER, $.SUBTEX_BRAID_01,
    $.MODEL_BRAID_02, $.MESH_PLAYER, $.SUBTEX_BRAID_02,
    $.MODEL_BRAID_03, $.MESH_PLAYER, $.SUBTEX_BRAID_03,
    $.MODEL_BRAID_04, $.MESH_PLAYER, $.SUBTEX_BRAID_04,
    $.MODEL_BRAID_05, $.MESH_PLAYER, $.SUBTEX_BRAID_05,
    $.MODEL_BRAID_06, $.MESH_PLAYER, $.SUBTEX_BRAID_06,
    $.MODEL_BRAID_07, $.MESH_PLAYER, $.SUBTEX_BRAID_07,
    $.MODEL_BRAID_08, $.MESH_PLAYER, $.SUBTEX_BRAID_08,
    $.MODEL_BRAID_09, $.MESH_PLAYER, $.SUBTEX_BRAID_09,
    $.MODEL_BRAID_10, $.MESH_PLAYER, $.SUBTEX_BRAID_10,
    $.MODEL_BRAID_11, $.MESH_PLAYER, $.SUBTEX_BRAID_11,
    $.MODEL_BRAID_12, $.MESH_PLAYER, $.SUBTEX_BRAID_12,
    $.MODEL_BRAID_13, $.MESH_PLAYER, $.SUBTEX_BRAID_13,
    $.MODEL_BRAID_14, $.MESH_PLAYER, $.SUBTEX_BRAID_14,
    $.MODEL_BRAID_15, $.MESH_PLAYER, $.SUBTEX_BRAID_15,
    $.MODEL_BRAID_16, $.MESH_PLAYER, $.SUBTEX_BRAID_16,
    $.MODEL_BRAID_17, $.MESH_PLAYER, $.SUBTEX_BRAID_17,
    $.MODEL_BRAID_18, $.MESH_PLAYER, $.SUBTEX_BRAID_18,
    $.MODEL_BRAID_19, $.MESH_PLAYER, $.SUBTEX_BRAID_19,
    $.MODEL_BRAID_20, $.MESH_PLAYER, $.SUBTEX_BRAID_20,
    $.MODEL_BRAID_21, $.MESH_PLAYER, $.SUBTEX_BRAID_21,
    $.MODEL_BRAID_22, $.MESH_PLAYER, $.SUBTEX_BRAID_22,
    $.MODEL_BRAID_23, $.MESH_PLAYER, $.SUBTEX_BRAID_23,
    $.MODEL_BRAID_24, $.MESH_PLAYER, $.SUBTEX_BRAID_24,
    $.MODEL_BRAID_25, $.MESH_PLAYER, $.SUBTEX_BRAID_25,
    $.MODEL_BRAID_26, $.MESH_PLAYER, $.SUBTEX_BRAID_26,
];

for (let i = 0; i < modelData.length;)
{
    const modelId = modelData[i++];
    const meshId = modelData[i++];
    const uvId = modelData[i++];

    models.set(modelId, {
        meshOffset: xyOffsets.get(meshId),
        uvOffset: uvOffsets.get(uvId),
        uvCoords: uvCoords.get(uvId)
    });
}

BufferArray.set(
    $.BUF_ARR_SPRITE,
    new BufferData(spriteBufferData),
    $.STATIC_DRAW
);

/*------------------------------------------------------------------------------
    Polygon
------------------------------------------------------------------------------*/
const polygonData = [];

const xyImage = [-1, 1, 0, -1, -1, 0, 1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0];
const meshOffset = polygonData.length * bytes;
polygonData.push(...xyImage);

const uvImage = [0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1];
const uvOffset = polygonData.length * bytes;
polygonData.push(...uvImage);

models.set($.MODEL_IMAGE, {
    meshOffset,
    uvOffset,
    uvCoords: uvImage
});

BufferArray.set(
    $.BUF_ARR_POLYGON,
    new BufferData(polygonData),
    $.STATIC_DRAW
);
