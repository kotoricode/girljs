import * as $ from "../const";
import { SafeMap, BufferData } from "../utility";
import { BufferArray } from "./buffer";
import { Texture } from "./texture";
import { Mesh } from "./mesh";

export const Model = {
    get(modelId)
    {
        return models.get(modelId);
    },
    getBufferId(modelId)
    {
        return modelBufferIds.get(modelId);
    },
    getDrawSize(modelId)
    {
        return modelDrawSizes.get(modelId);
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
    if (!Array.isArray(data)) throw Error;

    const offset = buffer.length * Float32Array.BYTES_PER_ELEMENT;
    buffer.push(...data);

    return offset;
};

const buildModelData = (data, posAttrId, posAttrSize) =>
{
    for (let i = 0; i < data.length;)
    {
        const modelId = data[i++];
        const meshId = data[i++];
        const uvId = data[i++];

        if (!cachePosOffsets.has(meshId))
        {
            const coords = Mesh.get(meshId);
            const coordsOffset = pushData(modelData, coords);

            cachePosOffsets.set(meshId, coordsOffset);
            cacheMeshDrawSizes.set(meshId, coords.length / posAttrSize);
        }

        if (!cacheUvOffsets.has(uvId))
        {
            const uv = Texture.getUv(uvId);
            const uvOffset = pushData(modelData, uv);

            cacheUvs.set(uvId, uv);
            cacheUvOffsets.set(uvId, uvOffset);
        }

        models.set(modelId, new SafeMap([
            [posAttrId, cachePosOffsets.get(meshId)],
            [$.A_UV, cacheUvOffsets.get(uvId)]
        ]));

        const texture = Texture.getUvData(uvId).base.texture;

        modelTextures.set(modelId, texture);
        modelUvs.set(modelId, cacheUvs.get(uvId));
        modelBufferIds.set(modelId, $.BUF_ARR_MODEL);
        modelDrawSizes.set(modelId, cacheMeshDrawSizes.get(meshId));
    }
};

/*------------------------------------------------------------------------------
    Data/definitions
------------------------------------------------------------------------------*/
const spriteXyzDef = [
    $.MODEL_GROUND,   $.MESH_GROUND, $.UV_GROUND,
    $.MODEL_BRAID_00, $.MESH_PLAYER, $.UV_BRAID_00,
    $.MODEL_BRAID_02, $.MESH_PLAYER, $.UV_BRAID_02,
    $.MODEL_BRAID_04, $.MESH_PLAYER, $.UV_BRAID_04,
    $.MODEL_BRAID_06, $.MESH_PLAYER, $.UV_BRAID_06,
    $.MODEL_BRAID_08, $.MESH_PLAYER, $.UV_BRAID_08,
    $.MODEL_BRAID_10, $.MESH_PLAYER, $.UV_BRAID_10,
    $.MODEL_BRAID_12, $.MESH_PLAYER, $.UV_BRAID_12,
    $.MODEL_BRAID_14, $.MESH_PLAYER, $.UV_BRAID_14,
    $.MODEL_BRAID_16, $.MESH_PLAYER, $.UV_BRAID_16,
    $.MODEL_BRAID_18, $.MESH_PLAYER, $.UV_BRAID_18,
    $.MODEL_BRAID_20, $.MESH_PLAYER, $.UV_BRAID_20,
    $.MODEL_BRAID_22, $.MESH_PLAYER, $.UV_BRAID_22,
    $.MODEL_BRAID_24, $.MESH_PLAYER, $.UV_BRAID_24,
    $.MODEL_BRAID_26, $.MESH_PLAYER, $.UV_BRAID_26,
];

const spriteXyDef = [
    $.MODEL_GIRL, $.MESH_GIRL, $.UV_GIRL_00,
];

const polygonDef = [
    // eslint-disable-next-line max-len
    $.MODEL_SCREEN, $.MESH_SCREEN, $.UV_SCREEN
];

/*------------------------------------------------------------------------------
    General
------------------------------------------------------------------------------*/
const modelData = [];
const models = new SafeMap();

const modelTextures = new SafeMap();
const modelUvs = new SafeMap();
const modelBufferIds = new SafeMap();
const modelDrawSizes = new SafeMap();

const cachePosOffsets = new SafeMap();
const cacheUvs = new SafeMap();
const cacheUvOffsets = new SafeMap();
const cacheMeshDrawSizes = new SafeMap();

buildModelData(spriteXyzDef, $.A_XYZ, 3);
buildModelData(spriteXyDef, $.A_XY, 2);

/*------------------------------------------------------------------------------
    Polygon
------------------------------------------------------------------------------*/
for (let i = 0; i < polygonDef.length;)
{
    const modelId = polygonDef[i++];
    const meshId = polygonDef[i++];
    const uvId = polygonDef[i++];

    models.set(modelId, new SafeMap([
        [$.A_XY, pushData(modelData, Mesh.get(meshId))],
        [$.A_UV, pushData(modelData, Texture.getUv(uvId))]
    ]));
}

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

models.set($.MODEL_DEBUG, new SafeMap([
    [$.A_XYZ, pushData(debugData, lines)]
]));

modelBufferIds.set($.MODEL_DEBUG, $.BUF_ARR_DEBUG);

BufferArray.data(
    $.BUF_ARR_DEBUG,
    new BufferData(debugData),
    $.DYNAMIC_DRAW
);
