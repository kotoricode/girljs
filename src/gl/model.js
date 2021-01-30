import * as $ from "../const";
import { isNullOrUndefined, SafeMap, SettableFloat32Array } from "../utility";
import { Buffer } from "./buffer";
import { Texture } from "./texture";
import { parseGlb } from "./glb";

/*------------------------------------------------------------------------------
    Consts
------------------------------------------------------------------------------*/
const MSH_DEBUG = "MSH_DEBUG";
const MSH_AV_PLAYER = "MSH_AV_PLAYER";
const MSH_GROUND = "MSH_GROUND";
const MSH_PLAYER = "MSH_PLAYER";
const MSH_SCREEN = "MSH_SCREEN";
const MSH_TEST = "MSH_TEST";
const MSH_MONKEY = "MSH_MONKEY";

const UV_TEST = "UV_TEST";
const UV_SCREEN = "UV_SCREEN";
const UV_GIRL_00 = "UV_GIRL_00";
const UV_GROUND = "UV_GROUND";
const UV_BRAID_00 = "UV_BRAID_00";
const UV_BRAID_02 = "UV_BRAID_02";
const UV_BRAID_04 = "UV_BRAID_04";
const UV_BRAID_06 = "UV_BRAID_06";
const UV_BRAID_08 = "UV_BRAID_08";
const UV_BRAID_10 = "UV_BRAID_10";
const UV_BRAID_12 = "UV_BRAID_12";
const UV_BRAID_14 = "UV_BRAID_14";
const UV_BRAID_16 = "UV_BRAID_16";
const UV_BRAID_18 = "UV_BRAID_18";
const UV_BRAID_20 = "UV_BRAID_20";
const UV_BRAID_22 = "UV_BRAID_22";
const UV_BRAID_24 = "UV_BRAID_24";
const UV_BRAID_26 = "UV_BRAID_26";
const UV_MONKEY = "UV_MONKEY";

/*------------------------------------------------------------------------------
    Mesh, UV
------------------------------------------------------------------------------*/
const meshXy = (minX, maxX, minY, maxY) => [
    minX, minY, 0,
    maxX, minY, 0,
    minX, maxY, 0,
    minX, maxY, 0,
    maxX, minY, 0,
    maxX, maxY, 0,
];

const meshXyScreen = (width, height) =>
{
    const x = width / $.RES_WIDTH;
    const y = height / $.RES_HEIGHT;

    return meshXy(-x, x, -y, y);
};

const meshXz = (minX, maxX, minZ, maxZ) => [
    minX, 0, maxZ,
    maxX, 0, maxZ,
    minX, 0, minZ,
    minX, 0, minZ,
    maxX, 0, maxZ,
    maxX, 0, minZ,
];

const uvRect1024 = (x, y, width, height) => uvRect(
    x, y, width, height, 1024, 1024
);

const uvRect = (x, y, width, height, baseWidth, baseHeight) =>
{
    const minX = x / baseWidth;
    const maxX = (x + width) / baseWidth;
    const minY = y / baseHeight;
    const maxY = (y + height) / baseHeight;

    return [
        minX, maxY,
        maxX, maxY,
        minX, minY,
        minX, minY,
        maxX, maxY,
        maxX, minY,
    ];
};

const meshes = new SafeMap([
    [MSH_DEBUG, [
        // bot
        -.5, -.5, -.5,
        -.5, -.5, .5,
        -.5, -.5, .5,
        .5, -.5, .5,
        .5, -.5, .5,
        .5, -.5, -.5,
        .5, -.5, -.5,
        -.5, -.5, -.5,

        // top
        -.5, .5, -.5,
        -.5, .5, .5,
        -.5, .5, .5,
        .5, .5, .5,
        .5, .5, .5,
        .5, .5, -.5,
        .5, .5, -.5,
        -.5, .5, -.5,

        // line
        -.5, -.5, -.5,
        -.5, .5, -.5,

        -.5, -.5, .5,
        -.5, .5, .5,

        .5, -.5, -.5,
        .5, .5, -.5,

        .5, -.5, .5,
        .5, .5, .5,
    ]],
    [MSH_GROUND, meshXz(-2, 2, -2, 2)],
    [MSH_PLAYER, meshXy(-0.4, 0.4, 0, 1.5)],
    [MSH_AV_PLAYER, meshXyScreen(187, 600)],
    [MSH_SCREEN, meshXyScreen($.RES_WIDTH, $.RES_HEIGHT)],
]);

const uvs = new SafeMap([
    [UV_GIRL_00, uvRect(0, 0, 356, 1170, 356, 1170)],
    [UV_BRAID_00, uvRect1024(0, 10, 136, 136)],
    [UV_BRAID_02, uvRect1024(256, 10, 136, 136)],
    [UV_BRAID_04, uvRect1024(512, 10, 136, 136)],
    [UV_BRAID_06, uvRect1024(768, 10, 136, 136)],
    [UV_BRAID_08, uvRect1024(128, 158, 136, 136)],
    [UV_BRAID_10, uvRect1024(384, 158, 136, 136)],
    [UV_BRAID_12, uvRect1024(640, 158, 136, 136)],
    [UV_BRAID_14, uvRect1024(0, 309, 136, 136)],
    [UV_BRAID_16, uvRect1024(256, 309, 136, 136)],
    [UV_BRAID_18, uvRect1024(512, 309, 136, 136)],
    [UV_BRAID_20, uvRect1024(768, 309, 136, 136)],
    [UV_BRAID_22, uvRect1024(128, 461, 136, 136)],
    [UV_BRAID_24, uvRect1024(384, 461, 136, 136)],
    [UV_BRAID_26, uvRect1024(640, 461, 136, 136)],
    [UV_GROUND, uvRect(94, 97, 256, 256, 512, 512)],
    [UV_SCREEN, [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]],
]);

class ExternalModel
{
    constructor(fileName, meshId, uvId)
    {
        this.url = `/data/${fileName}.glb`;
        this.meshId = meshId;
        this.uvId = uvId;
    }
}

const externalModels = [
    new ExternalModel("mesh", MSH_TEST, UV_TEST),
    new ExternalModel("big_monkey", MSH_MONKEY, UV_MONKEY),
];

const models = new SafeMap();

/*------------------------------------------------------------------------------
    Model
------------------------------------------------------------------------------*/
let loadPromise;

class ModelData
{
    constructor(attributes, bufferId, drawMode, drawSize, uvId, textureId)
    {
        this.attributes = attributes;
        this.bufferId = bufferId;
        this.drawMode = drawMode;
        this.drawSize = drawSize;
        this.uvId = uvId;
        this.textureId = textureId;
    }
}

export const Model = {
    isLoaded: false,
    getAttributes(modelId)
    {
        return getModel(modelId).attributes;
    },
    getBufferId(modelId)
    {
        return getModel(modelId).bufferId;
    },
    getDrawMode(modelId)
    {
        return getModel(modelId).drawMode;
    },
    getDrawSize(modelId)
    {
        return getModel(modelId).drawSize;
    },
    getTexture(modelId)
    {
        const textureId = getModel(modelId).textureId;

        return Texture.get(textureId);
    },
    getUv(modelId)
    {
        const uvId = getModel(modelId).uvId;

        return uvs.get(uvId);
    },
    isTextured(modelId)
    {
        const textureId = getModel(modelId).textureId;

        return !isNullOrUndefined(textureId);
    },
    load()
    {
        if (!loadPromise)
        {
            loadPromise = (async() =>
            {
                await fetchExternalModels();
                buildModels();
                Model.isLoaded = true;
            })();
        }

        return loadPromise;
    }
};

const getModel = (modelId) =>
{
    if (!Model.isLoaded) throw Error("Model is not Loaded yet");

    return models.get(modelId);
};

const fetchExternalModels = () =>
{
    return Promise.all(
        externalModels.map(obj => (async() =>
        {
            const response = await window.fetch(obj.url);
            const blob = await response.blob();
            const { mesh, uv } = await parseGlb(blob);

            meshes.set(obj.meshId, mesh);
            uvs.set(obj.uvId, uv);
        })())
    );
};

const pushData = (buffer, data) =>
{
    if (!Array.isArray(data)) throw Error;

    const offset = buffer.length;
    buffer.length += data.length;

    for (let i = 0; i < data.length; i++)
    {
        buffer[offset + i] = data[i];
    }

    return offset * Float32Array.BYTES_PER_ELEMENT;
};

const buildModels = () =>
{
    const modelData = [];
    const debugData = [];

    const modelDef = [
    /* eslint-disable max-len */
    //  MODEL_ID         MESH_ID        UV_ID        TEXTURE_ID
        $.MDL_AV_PLAYER, MSH_AV_PLAYER, UV_GIRL_00,  $.TEX_GIRL,
        $.MDL_GROUND,    MSH_GROUND,    UV_GROUND,   $.TEX_TEXTURE,
        $.MDL_BRAID_00,  MSH_PLAYER,    UV_BRAID_00, $.TEX_BRAID,
        $.MDL_BRAID_02,  MSH_PLAYER,    UV_BRAID_02, $.TEX_BRAID,
        $.MDL_BRAID_04,  MSH_PLAYER,    UV_BRAID_04, $.TEX_BRAID,
        $.MDL_BRAID_06,  MSH_PLAYER,    UV_BRAID_06, $.TEX_BRAID,
        $.MDL_BRAID_08,  MSH_PLAYER,    UV_BRAID_08, $.TEX_BRAID,
        $.MDL_BRAID_10,  MSH_PLAYER,    UV_BRAID_10, $.TEX_BRAID,
        $.MDL_BRAID_12,  MSH_PLAYER,    UV_BRAID_12, $.TEX_BRAID,
        $.MDL_BRAID_14,  MSH_PLAYER,    UV_BRAID_14, $.TEX_BRAID,
        $.MDL_BRAID_16,  MSH_PLAYER,    UV_BRAID_16, $.TEX_BRAID,
        $.MDL_BRAID_18,  MSH_PLAYER,    UV_BRAID_18, $.TEX_BRAID,
        $.MDL_BRAID_20,  MSH_PLAYER,    UV_BRAID_20, $.TEX_BRAID,
        $.MDL_BRAID_22,  MSH_PLAYER,    UV_BRAID_22, $.TEX_BRAID,
        $.MDL_BRAID_24,  MSH_PLAYER,    UV_BRAID_24, $.TEX_BRAID,
        $.MDL_BRAID_26,  MSH_PLAYER,    UV_BRAID_26, $.TEX_BRAID,
        $.MDL_TEST,      MSH_TEST,      UV_TEST,     $.TEX_TEXTURE,
        $.MDL_MONKEY,    MSH_MONKEY,    UV_MONKEY,   $.TEX_TEXTURE,
        $.MDL_FB,        MSH_SCREEN,    UV_SCREEN,   $.TEX_FB,
        $.MDL_TEXT,      MSH_SCREEN,    UV_SCREEN,   $.TEX_UI_TEXT,
        $.MDL_BUBBLE,    MSH_SCREEN,    UV_SCREEN,   $.TEX_UI_BUBBLE,
    //  MODEL_ID         MESH_ID        UV_ID        TEXTURE_ID
    /* eslint-disable max-len */
    ];

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
            const xyz = meshes.get(meshId);
            const xyzOffset = pushData(modelData, xyz);

            xyzOffsets.set(meshId, xyzOffset);
            drawSizes.set(meshId, xyz.length / 3);
        }

        if (!uvOffsets.has(uvId))
        {
            const uv = uvs.get(uvId);
            const uvOffset = pushData(modelData, uv);

            uvOffsets.set(uvId, uvOffset);
        }

        const attrib = new SafeMap([
            [$.A_XYZ, xyzOffsets.get(meshId)],
            [$.A_UV, uvOffsets.get(uvId)]
        ]);

        models.set(modelId, new ModelData(
            attrib,
            $.BUF_ARR_MODEL,
            $.TRIANGLES,
            drawSizes.get(meshId),
            uvId,
            textureId,
        ));
    }

    /*--------------------------------------------------------------------------
        Debug
    --------------------------------------------------------------------------*/
    const mesh = meshes.get(MSH_DEBUG);

    const debugAttrib = new SafeMap([
        [$.A_XYZ, pushData(debugData, mesh)]
    ]);

    models.set($.MDL_DEBUG, new ModelData(
        debugAttrib,
        $.BUF_ARR_DEBUG,
        $.LINES,
        mesh.length / 3,
    ));

    /*--------------------------------------------------------------------------
        Set to buffer
    --------------------------------------------------------------------------*/
    Buffer.setData($.BUF_ARR_MODEL, new SettableFloat32Array(modelData));
    Buffer.setData($.BUF_ARR_DEBUG, new SettableFloat32Array(debugData));
};
