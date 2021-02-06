import * as $ from "../const";
import { SafeMap, SettableFloat32Array } from "../utility";
import { Buffer } from "./buffer";
import { parseGlb } from "./glb";

/*------------------------------------------------------------------------------
    Consts
------------------------------------------------------------------------------*/
const MSH_DEBUG = "MSH_DEBUG";
const MSH_PLAYER = "MSH_PLAYER";
const MSH_SCREEN = "MSH_SCREEN";
const MSH_TEST = "MSH_TEST";
const MSH_MONKEY = "MSH_MONKEY";
const MSH_HOME = "MSH_HOME";

const UV_TEST = "UV_TEST";
const UV_HOME = "UV_HOME";
const UV_SCREEN = "UV_SCREEN";
const UV_GIRL_IDLE_00 = "UB_GIRL_IDLE_00";
const UV_GIRL_MOVE_00 = "UB_GIRL_MOVE_00";
const UV_GIRL_MOVE_01 = "UB_GIRL_MOVE_01";
const UV_MONKEY = "UV_MONKEY";

/*------------------------------------------------------------------------------
    Internal meshes & UVs
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

/*------------------------------------------------------------------------------
    Model
------------------------------------------------------------------------------*/
export class Model
{
    constructor(attributes, bufferId, drawMode, drawSize, meshId, uvId, textureId)
    {
        this.attributes = attributes;
        this.bufferId = bufferId;
        this.drawMode = drawMode;
        this.meshId = meshId;
        this.uvId = uvId;
        this.textureId = textureId;

        this.drawSize = drawSize;
        if (!Number.isInteger(this.drawSize)) throw this.drawSize;

        Object.freeze(this);
    }

    static get(modelId)
    {
        if (!isLoaded) throw Error("Model not loaded");

        return models.get(modelId);
    }

    static getDynamicMesh(meshId)
    {
        return dynamicMeshes.get(meshId);
    }

    static isLoaded()
    {
        return isLoaded;
    }

    static load()
    {
        if (!loadPromise)
        {
            loadPromise = buildModels();
        }

        return loadPromise;
    }
}

const dynamicMeshes = new SafeMap([
    [MSH_DEBUG, new SettableFloat32Array(3 * 2 * 12 * 10)],
]);

const buildModels = async() =>
{
    /*--------------------------------------------------------------------------
        Internal meshes, UVs
    --------------------------------------------------------------------------*/
    const meshes = new SafeMap([
        [MSH_PLAYER, meshXy(-0.375, 0.375, 0, 1.5)],
        [MSH_SCREEN, meshXyScreen($.RES_WIDTH, $.RES_HEIGHT)],
    ]);

    const uvs = new SafeMap([
        [UV_GIRL_IDLE_00, uvRect1024(0, 0, 123, 286)],
        [UV_GIRL_MOVE_00, uvRect1024(123, 0, 123, 286)],
        [UV_GIRL_MOVE_01, uvRect1024(246, 0, 123, 286)],
        [UV_SCREEN, [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]],
    ]);

    /*--------------------------------------------------------------------------
        Download external models
    --------------------------------------------------------------------------*/
    class ExternalModelInfo
    {
        constructor(fileName, meshId, uvId)
        {
            this.url = `/mdl/${fileName}.glb`;
            this.meshId = meshId;
            this.uvId = uvId;

            Object.freeze(this);
        }
    }

    const externalModels = [
        new ExternalModelInfo("mesh", MSH_TEST, UV_TEST),
        new ExternalModelInfo("big_monkey", MSH_MONKEY, UV_MONKEY),
        new ExternalModelInfo("home", MSH_HOME, UV_HOME)
    ];

    await Promise.all(
        externalModels.map(extModel => (async() =>
        {
            const response = await window.fetch(extModel.url);
            const blob = await response.blob();
            const { mesh, uv } = await parseGlb(blob);

            meshes.set(extModel.meshId, mesh);
            uvs.set(extModel.uvId, uv);
        })())
    );

    /*--------------------------------------------------------------------------
        Build models from mesh + UV + texture information
    --------------------------------------------------------------------------*/
    const modelData = [];

    const modelDef = [
    //  MODEL ID            MESH ID     UV ID            TEXTURE ID
        $.MDL_GIRL_IDLE_00, MSH_PLAYER, UV_GIRL_IDLE_00, $.TEX_GIRL,
        $.MDL_GIRL_MOVE_00, MSH_PLAYER, UV_GIRL_MOVE_00, $.TEX_GIRL,
        $.MDL_GIRL_MOVE_01, MSH_PLAYER, UV_GIRL_MOVE_01, $.TEX_GIRL,
        $.MDL_TEST,         MSH_TEST,   UV_TEST,         $.TEX_WORLD,
        $.MDL_MONKEY,       MSH_MONKEY, UV_MONKEY,       $.TEX_WOOD,
        $.MDL_FB,           MSH_SCREEN, UV_SCREEN,       $.TEX_FB,
        $.MDL_TEXT,         MSH_SCREEN, UV_SCREEN,       $.TEX_UI_TEXT,
        $.MDL_BUBBLE,       MSH_SCREEN, UV_SCREEN,       $.TEX_UI_BUBBLE,
        $.MDL_HOME,         MSH_HOME,   UV_HOME,         $.TEX_HOME
    ];

    // Push data to modelData and return the offset
    const pushModelData = (data) =>
    {
        if (!Array.isArray(data) && !(data instanceof Float32Array))
        {
            throw Error("Not an array");
        }

        const offset = modelData.length;
        modelData.length += data.length;

        for (let i = 0; i < data.length; i++)
        {
            modelData[offset + i] = data[i];
        }

        return offset * Float32Array.BYTES_PER_ELEMENT;
    };

    // Local build caches
    const meshOffsets = new SafeMap();
    const uvOffsets = new SafeMap();

    for (let i = 0; i < modelDef.length;)
    {
        const modelId = modelDef[i++];
        const meshId = modelDef[i++];
        const uvId = modelDef[i++];
        const textureId = modelDef[i++];

        if (!meshOffsets.has(meshId))
        {
            const mesh = meshes.get(meshId);
            const meshOffset = pushModelData(mesh);

            meshOffsets.set(meshId, meshOffset);
        }

        if (!uvOffsets.has(uvId))
        {
            const uv = uvs.get(uvId);
            const uvOffset = pushModelData(uv);

            uvOffsets.set(uvId, uvOffset);
        }

        const attributes = new SafeMap([
            [$.A_POSITION, meshOffsets.get(meshId)],
            [$.A_TEXCOORD, uvOffsets.get(uvId)]
        ]);

        models.set(modelId, new Model(
            attributes,
            $.BUF_ARR_MODEL,
            $.TRIANGLES,
            meshes.get(meshId).length / 3,
            meshId,
            uvId,
            textureId,
        ));
    }

    /*--------------------------------------------------------------------------
        Debug
    --------------------------------------------------------------------------*/
    const debugAttrib = new SafeMap([
        [$.A_POSITION, 0]
    ]);

    models.set($.MDL_DEBUG, new Model(
        debugAttrib,
        $.BUF_ARR_DEBUG,
        $.LINES,
        dynamicMeshes.get(MSH_DEBUG).length / 3,
        MSH_DEBUG
    ));

    /*--------------------------------------------------------------------------
        Push to buffer and finish
    --------------------------------------------------------------------------*/
    Buffer.setData($.BUF_ARR_MODEL, new SettableFloat32Array(modelData));
    isLoaded = true;
};

/*------------------------------------------------------------------------------
    Init
------------------------------------------------------------------------------*/
const models = new SafeMap();
let isLoaded = false;
let loadPromise;
