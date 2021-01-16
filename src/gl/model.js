import * as $ from "../const";
import { BufferData } from "../utils/better-builtins";
import { BufferArray } from "./buffer";
import { Texture } from "./texture";
import { getMesh } from "./mesh";
import { SafeMap } from "../utils/better-builtins";

export const Model = {
    get(modelId)
    {
        return models.get(modelId);
    },
    getBufferId(modelId)
    {
        return modelBuffers.get(modelId);
    },
    getTexture(modelId)
    {
        return modelTextures.get(modelId);
    },
    getUv(modelId)
    {
        return modelUvCoords.get(modelId);
    }
};

const pushData = (buffer, data) =>
{
    const offset = buffer.length * Float32Array.BYTES_PER_ELEMENT;
    buffer.push(...data);

    return offset;
};

/*------------------------------------------------------------------------------
    Data
------------------------------------------------------------------------------*/
const modelData = [
    $.MODEL_GROUND,   $.MESH_GROUND, $.SUBTEX_GROUND,
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

/*------------------------------------------------------------------------------
    Sprite
------------------------------------------------------------------------------*/
const spriteBufferData = [];
const xyzOffsets = new SafeMap();
const uvOffsets = new SafeMap();
const uvs = new SafeMap();
const models = new SafeMap();
const modelTextures = new SafeMap();
const modelUvCoords = new SafeMap();
const modelBuffers = new SafeMap();

for (let i = 0; i < modelData.length;)
{
    const modelId = modelData[i++];
    const meshId = modelData[i++];
    const subTexId = modelData[i++];

    if (!xyzOffsets.has(meshId))
    {
        const coords = getMesh(meshId);
        const xyzOffset = pushData(spriteBufferData, coords);
        xyzOffsets.set(meshId, xyzOffset);
    }

    if (!uvOffsets.has(subTexId))
    {
        const coords = Texture.getUvFromSubTexture(subTexId);
        uvs.set(subTexId, coords);

        const uvOffset = pushData(spriteBufferData, coords);
        uvOffsets.set(subTexId, uvOffset);
    }

    models.set(modelId, new SafeMap([
        [$.A_XYZ, xyzOffsets.get(meshId)],
        [$.A_UV, uvOffsets.get(subTexId)]
    ]));

    const tex = Texture.getSubTextureData(subTexId).baseData.texture;
    modelTextures.set(modelId, tex);
    modelUvCoords.set(modelId, uvs.get(subTexId));
    modelBuffers.set(modelId, $.BUF_ARR_SPRITE);
}

BufferArray.data(
    $.BUF_ARR_SPRITE,
    new BufferData(spriteBufferData),
    $.STATIC_DRAW
);

/*------------------------------------------------------------------------------
    Polygon
------------------------------------------------------------------------------*/
const polygonData = [];

const xyzImage = [-1, 1, 0, -1, -1, 0, 1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0];
const xyzOffset = pushData(polygonData, xyzImage);

const uvImage = [0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1];
const uvOffset = pushData(polygonData, uvImage);

models.set($.MODEL_IMAGE, new SafeMap([
    [$.A_XYZ, xyzOffset],
    [$.A_UV, uvOffset]
]));

modelBuffers.set($.MODEL_IMAGE, $.BUF_ARR_POLYGON);

BufferArray.data(
    $.BUF_ARR_POLYGON,
    new BufferData(polygonData),
    $.STATIC_DRAW
);

/*------------------------------------------------------------------------------
    Debug
------------------------------------------------------------------------------*/
const debugData = [];

const lines = [
    0, 0, 0,
    2, 2, 2,
    0, 0, 0,
    -2, 2, 2,
    0, 0, 0,
    2, -2, 2,
    0, 0, 0,
    -2, 2, -2
];

const lineXyzOffset = pushData(debugData, lines);

models.set($.MODEL_DEBUG, new SafeMap([
    [$.A_XYZ, lineXyzOffset]
]));

modelBuffers.set($.MODEL_DEBUG, $.BUF_ARR_DEBUG);

BufferArray.data(
    $.BUF_ARR_DEBUG,
    new BufferData(debugData),
    $.DYNAMIC_DRAW
);
