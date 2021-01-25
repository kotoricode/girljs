import * as $ from "../const";
import { SafeMap, SettableFloat32Array } from "../utility";
import { Buffer } from "./buffer";
import { Texture } from "./texture";
import { Mesh } from "./mesh";

class ModelData
{
    constructor(attributes, bufferId, uv, uvId, drawSize)
    {
        this.attributes = attributes;
        this.bufferId = bufferId;
        this.uv = uv;
        this.uvId = uvId;
        this.drawSize = drawSize;
    }
}

export const Model = {
    get(modelId)
    {
        return models.get(modelId).attributes;
    },
    getBufferId(modelId)
    {
        return models.get(modelId).bufferId;
    },
    getDrawSize(modelId)
    {
        return models.get(modelId).drawSize;
    },
    getUv(modelId)
    {
        return models.get(modelId).uv;
    },
    getUvId(modelId)
    {
        return models.get(modelId).uvId;
    }
};

const pushData = (buffer, data) =>
{
    if (!Array.isArray(data)) throw Error;

    const offset = buffer.length * Float32Array.BYTES_PER_ELEMENT;
    buffer.push(...data);

    return offset;
};

const buildModelData = () =>
{
    const modelData = [];

    const xyzOffsets = new SafeMap();
    const uvs = new SafeMap();
    const uvOffsets = new SafeMap();
    const drawSizes = new SafeMap();

    for (let i = 0; i < modelDef.length;)
    {
        const modelId = modelDef[i++];
        const meshId = modelDef[i++];
        const uvId = modelDef[i++];

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

        models.set(modelId, new ModelData(
            new SafeMap([
                [$.A_XYZ, xyzOffsets.get(meshId)],
                [$.A_UV, uvOffsets.get(uvId)]
            ]),
            $.BUF_ARR_MODEL,
            uvs.get(uvId),
            uvId,
            drawSizes.get(meshId),
        ));
    }

    Buffer.setData(
        $.BUF_ARR_MODEL,
        new SettableFloat32Array(modelData)
    );
};

/*------------------------------------------------------------------------------
    Data/definitions
------------------------------------------------------------------------------*/
const modelDef = [
    $.MODEL_GIRL,     $.MESH_AVATAR_PLAYER, $.UV_GIRL_00,
    $.MODEL_GROUND,   $.MESH_GROUND,        $.UV_GROUND,
    $.MODEL_BRAID_00, $.MESH_PLAYER,        $.UV_BRAID_00,
    $.MODEL_BRAID_02, $.MESH_PLAYER,        $.UV_BRAID_02,
    $.MODEL_BRAID_04, $.MESH_PLAYER,        $.UV_BRAID_04,
    $.MODEL_BRAID_06, $.MESH_PLAYER,        $.UV_BRAID_06,
    $.MODEL_BRAID_08, $.MESH_PLAYER,        $.UV_BRAID_08,
    $.MODEL_BRAID_10, $.MESH_PLAYER,        $.UV_BRAID_10,
    $.MODEL_BRAID_12, $.MESH_PLAYER,        $.UV_BRAID_12,
    $.MODEL_BRAID_14, $.MESH_PLAYER,        $.UV_BRAID_14,
    $.MODEL_BRAID_16, $.MESH_PLAYER,        $.UV_BRAID_16,
    $.MODEL_BRAID_18, $.MESH_PLAYER,        $.UV_BRAID_18,
    $.MODEL_BRAID_20, $.MESH_PLAYER,        $.UV_BRAID_20,
    $.MODEL_BRAID_22, $.MESH_PLAYER,        $.UV_BRAID_22,
    $.MODEL_BRAID_24, $.MESH_PLAYER,        $.UV_BRAID_24,
    $.MODEL_BRAID_26, $.MESH_PLAYER,        $.UV_BRAID_26,
    $.MODEL_TEST,     $.MESH_TEST,          $.UV_TEST,
    $.MODEL_SCREEN,   $.MESH_SCREEN,        $.UV_SCREEN
];

const models = new SafeMap();

buildModelData();

/*------------------------------------------------------------------------------
    Debug
------------------------------------------------------------------------------*/
const debugData = [];
const mesh = Mesh.get($.MESH_DEBUG);

models.set($.MODEL_DEBUG, new ModelData(
    new SafeMap([
        [$.A_XYZ, pushData(debugData, mesh)]
    ]),
    $.BUF_ARR_DEBUG,
    [],
    "",
    mesh.length / 3
));

Buffer.setData(
    $.BUF_ARR_DEBUG,
    new SettableFloat32Array(debugData)
);
