import * as $ from "../const";
import { SafeMap, BufferData } from "../utility";
import { BufferArray } from "./buffer";
import { Texture } from "./texture";
import { getMesh } from "./mesh";

export const Model = {
    get(modelId)
    {
        return models.get(modelId);
    },
    getBufferId(modelId)
    {
        return modelBufferIds.get(modelId);
    },
    getTexture(modelId)
    {
        return modelTextures.get(modelId);
    },
    getUv(modelId)
    {
        return modelUvs.get(modelId);
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
const modelDef = [
    $.MODEL_GIRL,     $.MESH_GIRL,   $.SUBTEX_GIRL_00,
    $.MODEL_GROUND,   $.MESH_GROUND, $.SUBTEX_GROUND,
    $.MODEL_BRAID_00, $.MESH_PLAYER, $.SUBTEX_BRAID_00,
    $.MODEL_BRAID_02, $.MESH_PLAYER, $.SUBTEX_BRAID_02,
    $.MODEL_BRAID_04, $.MESH_PLAYER, $.SUBTEX_BRAID_04,
    $.MODEL_BRAID_06, $.MESH_PLAYER, $.SUBTEX_BRAID_06,
    $.MODEL_BRAID_08, $.MESH_PLAYER, $.SUBTEX_BRAID_08,
    $.MODEL_BRAID_10, $.MESH_PLAYER, $.SUBTEX_BRAID_10,
    $.MODEL_BRAID_12, $.MESH_PLAYER, $.SUBTEX_BRAID_12,
    $.MODEL_BRAID_14, $.MESH_PLAYER, $.SUBTEX_BRAID_14,
    $.MODEL_BRAID_16, $.MESH_PLAYER, $.SUBTEX_BRAID_16,
    $.MODEL_BRAID_18, $.MESH_PLAYER, $.SUBTEX_BRAID_18,
    $.MODEL_BRAID_20, $.MESH_PLAYER, $.SUBTEX_BRAID_20,
    $.MODEL_BRAID_22, $.MESH_PLAYER, $.SUBTEX_BRAID_22,
    $.MODEL_BRAID_24, $.MESH_PLAYER, $.SUBTEX_BRAID_24,
    $.MODEL_BRAID_26, $.MESH_PLAYER, $.SUBTEX_BRAID_26,
];

/*------------------------------------------------------------------------------
    Sprite
------------------------------------------------------------------------------*/
const modelData = [];
const xyzOffsets = new SafeMap();
const uvOffsets = new SafeMap();
const uvs = new SafeMap();
const models = new SafeMap();
const modelTextures = new SafeMap();
const modelUvs = new SafeMap();
const modelBufferIds = new SafeMap();

for (let i = 0; i < modelDef.length;)
{
    const modelId = modelDef[i++];
    const meshId = modelDef[i++];
    const subTexId = modelDef[i++];

    if (!xyzOffsets.has(meshId))
    {
        const coords = getMesh(meshId);
        const xyzOffset = pushData(modelData, coords);

        xyzOffsets.set(meshId, xyzOffset);
    }

    if (!uvOffsets.has(subTexId))
    {
        const uv = Texture.getUv(subTexId);
        const uvOffset = pushData(modelData, uv);

        uvs.set(subTexId, uv);
        uvOffsets.set(subTexId, uvOffset);
    }

    models.set(modelId, new SafeMap([
        [$.A_XYZ, xyzOffsets.get(meshId)],
        [$.A_UV, uvOffsets.get(subTexId)]
    ]));

    const texture = Texture.getSubTexData(subTexId).base.texture;
    modelTextures.set(modelId, texture);
    modelUvs.set(modelId, uvs.get(subTexId));
    modelBufferIds.set(modelId, $.BUF_ARR_MODEL);
}


/*------------------------------------------------------------------------------
    Polygon
------------------------------------------------------------------------------*/
models.set($.MODEL_SCREEN, new SafeMap([
    [$.A_XYZ, pushData(modelData,
        [
            -1, 1, 0,
            -1, -1, 0,
            1, -1, 0,
            1, -1, 0,
            1, 1, 0,
            -1, 1, 0
        ]
    )],
    [$.A_UV, pushData(modelData, [
        0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1
    ])]
]));

modelBufferIds.set($.MODEL_SCREEN, $.BUF_ARR_MODEL);

BufferArray.data(
    $.BUF_ARR_MODEL,
    new BufferData(modelData),
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

modelBufferIds.set($.MODEL_DEBUG, $.BUF_ARR_DEBUG);

BufferArray.data(
    $.BUF_ARR_DEBUG,
    new BufferData(debugData),
    $.DYNAMIC_DRAW
);
