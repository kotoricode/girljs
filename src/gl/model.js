import * as $ from "../const";
import { SafeMap, SettableFloat32Array } from "../utility";
import { Buffer } from "./buffer";
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

const buildModelDataQuad = () =>
{
    const xyzOffsets = new SafeMap();
    const uvs = new SafeMap();
    const uvOffsets = new SafeMap();
    const drawSizes = new SafeMap();

    for (let i = 0; i < quadDef.length;)
    {
        const modelId = quadDef[i++];
        const meshId = quadDef[i++];
        const uvId = quadDef[i++];

        if (!xyzOffsets.has(meshId))
        {
            const xyz = Mesh.get(meshId);
            const xyzOffset = pushData(modelData, xyz);

            xyzOffsets.set(meshId, xyzOffset);
            drawSizes.set(meshId, xyz.length / 3);
        }

        if (!uvOffsets.has(uvId))
        {
            const uv = Texture.getUv(uvId);
            const uvOffset = pushData(modelData, uv);

            uvs.set(uvId, uv);
            uvOffsets.set(uvId, uvOffset);
        }

        models.set(modelId, new SafeMap([
            [$.A_XYZ, xyzOffsets.get(meshId)],
            [$.A_UV, uvOffsets.get(uvId)]
        ]));

        const texture = Texture.get(uvId);

        modelTextures.set(modelId, texture);
        modelUvs.set(modelId, uvs.get(uvId));
        modelBufferIds.set(modelId, $.BUF_ARR_MODEL);
        modelDrawSizes.set(modelId, drawSizes.get(meshId));
    }
};

const buildModelDataPolygon = () =>
{
    for (let i = 0; i < polygonDef.length;)
    {
        const modelId = polygonDef[i++];
        const meshId = polygonDef[i++];
        const uvId = polygonDef[i++];

        models.set(modelId, new SafeMap([
            [$.A_XYZ, pushData(modelData, Mesh.get(meshId))],
            [$.A_UV, pushData(modelData, Texture.getUv(uvId))]
        ]));
    }

    modelBufferIds.set($.MODEL_SCREEN, $.BUF_ARR_MODEL);
};

/*------------------------------------------------------------------------------
    Data/definitions
------------------------------------------------------------------------------*/
const quadDef = [
    $.MODEL_GIRL,     $.MESH_AVATAR_PLAYER,   $.UV_GIRL_00,
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


const polygonDef = [
    // eslint-disable-next-line max-len
    $.MODEL_SCREEN, $.MESH_SCREEN, $.UV_SCREEN
];

/*------------------------------------------------------------------------------
    Model
------------------------------------------------------------------------------*/
const modelData = [];
const models = new SafeMap();
const modelBufferIds = new SafeMap();

const modelTextures = new SafeMap();
const modelUvs = new SafeMap();
const modelDrawSizes = new SafeMap();

buildModelDataQuad();
buildModelDataPolygon();

Buffer.setData(
    $.BUF_ARR_MODEL,
    new SettableFloat32Array(modelData)
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

Buffer.setData(
    $.BUF_ARR_DEBUG,
    new SettableFloat32Array(debugData)
);
