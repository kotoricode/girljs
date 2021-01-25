import * as $ from "../const";
import { SafeMap, SettableFloat32Array } from "../utility";
import { Buffer } from "./buffer";
import { Mesh } from "./mesh";
import { Texture } from "./texture";

class ModelData
{
    constructor(attributes, bufferId, uvId, textureId, drawSize)
    {
        this.attributes = attributes;
        this.bufferId = bufferId;
        this.uvId = uvId;
        this.textureId = textureId;
        this.drawSize = drawSize;
    }
}

export const Model = {
    getAttributes(modelId)
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
    getTexture(modelId)
    {
        const textureId = models.get(modelId).textureId;

        return Texture.get(textureId);
    },
    getUv(modelId)
    {
        const uvId = Model.getUvId(modelId);

        return Mesh.getUv(uvId);
    },
    getUvId(modelId)
    {
        return models.get(modelId).uvId;
    },
    load()
    {
        return new Promise((resolve) =>
        {
            // window.fetch("/data/test.blob").then((res) =>
            // {
            //     res.blob().then((data) =>
            //     {
            //         console.log(data);

            //         data.arrayBuffer().then((arr) =>
            //         {
            //             const c = new Float32Array(arr);
            //             console.log(c);
            //         });
            //     });
            // });

            window.setTimeout(() =>
            {
                resolve();
            }, 400);
        });
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
    const uvOffsets = new SafeMap();
    const drawSizes = new SafeMap();

    for (let i = 0; i < modelDef.length;)
    {
        const modelId = modelDef[i++];
        const meshId = modelDef[i++];
        const uvId = modelDef[i++];
        const textureId = modelDef[i++];

        if (!xyzOffsets.has(meshId))
        {
            const xyz = Mesh.get(meshId);
            const xyzOffset = pushData(modelData, xyz);

            xyzOffsets.set(meshId, xyzOffset);
            drawSizes.set(meshId, xyz.length / 3);
        }

        if (!uvOffsets.has(uvId))
        {
            const uv = Mesh.getUv(uvId);
            const uvOffset = pushData(modelData, uv);

            uvOffsets.set(uvId, uvOffset);
        }

        models.set(modelId, new ModelData(
            new SafeMap([
                [$.A_XYZ, xyzOffsets.get(meshId)],
                [$.A_UV, uvOffsets.get(uvId)]
            ]),
            $.BUF_ARR_MODEL,
            uvId,
            textureId,
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
    $.MODEL_GIRL,     $.MESH_AV_PLAYER, $.UV_GIRL_00,  $.TEX_GIRL,
    $.MODEL_GROUND,   $.MESH_GROUND,    $.UV_GROUND,   $.TEX_TEXTURE,
    $.MODEL_BRAID_00, $.MESH_PLAYER,    $.UV_BRAID_00, $.TEX_BRAID,
    $.MODEL_BRAID_02, $.MESH_PLAYER,    $.UV_BRAID_02, $.TEX_BRAID,
    $.MODEL_BRAID_04, $.MESH_PLAYER,    $.UV_BRAID_04, $.TEX_BRAID,
    $.MODEL_BRAID_06, $.MESH_PLAYER,    $.UV_BRAID_06, $.TEX_BRAID,
    $.MODEL_BRAID_08, $.MESH_PLAYER,    $.UV_BRAID_08, $.TEX_BRAID,
    $.MODEL_BRAID_10, $.MESH_PLAYER,    $.UV_BRAID_10, $.TEX_BRAID,
    $.MODEL_BRAID_12, $.MESH_PLAYER,    $.UV_BRAID_12, $.TEX_BRAID,
    $.MODEL_BRAID_14, $.MESH_PLAYER,    $.UV_BRAID_14, $.TEX_BRAID,
    $.MODEL_BRAID_16, $.MESH_PLAYER,    $.UV_BRAID_16, $.TEX_BRAID,
    $.MODEL_BRAID_18, $.MESH_PLAYER,    $.UV_BRAID_18, $.TEX_BRAID,
    $.MODEL_BRAID_20, $.MESH_PLAYER,    $.UV_BRAID_20, $.TEX_BRAID,
    $.MODEL_BRAID_22, $.MESH_PLAYER,    $.UV_BRAID_22, $.TEX_BRAID,
    $.MODEL_BRAID_24, $.MESH_PLAYER,    $.UV_BRAID_24, $.TEX_BRAID,
    $.MODEL_BRAID_26, $.MESH_PLAYER,    $.UV_BRAID_26, $.TEX_BRAID,
    $.MODEL_TEST,     $.MESH_TEST,      $.UV_TEST,     $.TEX_TEXTURE,
    $.MODEL_FB,       $.MESH_SCREEN,    $.UV_SCREEN,   $.TEX_FB,
    $.MODEL_TEXT,     $.MESH_SCREEN,    $.UV_TEXT,     $.TEX_UI_TEXT,
    $.MODEL_BUBBLE,   $.MESH_SCREEN,    $.UV_BUBBLE,   $.TEX_UI_BUBBLE
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
    null,
    null,
    mesh.length / 3
));

Buffer.setData(
    $.BUF_ARR_DEBUG,
    new SettableFloat32Array(debugData)
);
