import * as $ from "../const";
import { SIZEOF_FLOAT32, SIZEOF_UINT16 } from "../utility";
import { Buffer } from "./buffer";

/*------------------------------------------------------------------------------
    Internal meshes & UVs
------------------------------------------------------------------------------*/
const meshXy = (minX, maxX, minY, maxY) => [
    minX, minY, 0,
    maxX, minY, 0,
    minX, maxY, 0,
    maxX, maxY, 0,
];

const meshXyScreen = (width, height) =>
{
    const x = width / $.RES_WIDTH;
    const y = height / $.RES_HEIGHT;

    return meshXy(-x, x, -y, y);
};

const uvRect1024 = (x, y, width, height) =>
{
    const minX = x / 1024;
    const maxX = (x + width) / 1024;
    const minY = y / 1024;
    const maxY = (y + height) / 1024;

    return [
        minX, maxY,
        maxX, maxY,
        minX, minY,
        maxX, minY,
    ];
};

/*------------------------------------------------------------------------------
    Model
------------------------------------------------------------------------------*/
export class Model
{
    constructor(
        aOffsets,
        aBufferId,
        indexBufferId,
        drawMode,
        drawOffset,
        drawSize
    )
    {
        this.aOffsets = aOffsets;
        this.aBufferId = aBufferId;
        this.indexBufferId = indexBufferId;
        this.drawMode = drawMode;
        this.drawOffset = drawOffset;
        this.drawSize = drawSize;
    }

    static get(modelId)
    {
        if (!isLoaded) throw Error("Model not loaded");

        return models.get(modelId);
    }

    static getDynamicMesh(modelId)
    {
        const meshId = meshIds.get(modelId);

        return dynamicMeshes.get(meshId);
    }

    static getDynamicIndex(modelId)
    {
        const indexId = indexIds.get(modelId);

        return dynamicIndices.get(indexId);
    }

    static getTextureId(modelId)
    {
        return textureIds.get(modelId);
    }

    static isLoaded()
    {
        return isLoaded;
    }

    static isTextured(modelId)
    {
        return textureIds.has(modelId);
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

class ExternalModel
{
    constructor(fileName, meshId, uvId, indexId)
    {
        this.url = `/mdl/${fileName}.glb`;
        this.meshId = meshId;
        this.uvId = uvId;
        this.indexId = indexId;

        Object.freeze(this);
    }
}

const glbFetch = async(extModel, meshes, uvs, indices) =>
{
    /*--------------------------------------------------------------------------
        Download glb
    --------------------------------------------------------------------------*/
    const response = await window.fetch(extModel.url);
    const blob = await response.blob();
    const reader = blob.stream().getReader();
    const data = new Uint8Array(blob.size);
    const dataView = new DataView(data.buffer);

    for (let offset = 0; offset !== blob.size;)
    {
        const { value } = await reader.read();
        data.set(value, offset);
        offset += value.byteLength;
    }

    reader.cancel();

    /*--------------------------------------------------------------------------
        Get JSON
    --------------------------------------------------------------------------*/
    const jsonLen = dataView.getUint32(12, true);

    const jsonStart = 20;
    const jsonEnd = jsonStart + jsonLen;
    const json = data.subarray(jsonStart, jsonEnd);

    const decoder = new TextDecoder();
    const jsonString = decoder.decode(json);
    const meta = JSON.parse(jsonString);

    /*--------------------------------------------------------------------------
        Process binary
    --------------------------------------------------------------------------*/
    const binStart = jsonEnd + 8;
    const [viewMesh, viewUv, viewIndex] = meta.bufferViews;

    const getFloat32 = dataView.getFloat32.bind(dataView);
    const getUint16 = dataView.getUint16.bind(dataView);

    meshes.set(
        extModel.meshId,
        glbRead(getFloat32, binStart, viewMesh, SIZEOF_FLOAT32)
    );

    uvs.set(
        extModel.uvId,
        glbRead(getFloat32, binStart, viewUv, SIZEOF_FLOAT32)
    );

    indices.set(
        extModel.indexId,
        glbRead(getUint16, binStart, viewIndex, SIZEOF_UINT16)
    );
};

const glbRead = (dataViewGet, binStart, view, sizeOf) =>
{
    const array = new Array(view.byteLength / sizeOf);
    const viewStart = binStart + view.byteOffset;

    for (let i = 0; i < array.length; i++)
    {
        array[i] = dataViewGet(viewStart + i * sizeOf, true);
    }

    return array;
};

const buildModels = async() =>
{
    const MSH_PLAYER = Symbol();
    const MSH_SCREEN = Symbol();
    const MSH_MONKEY = Symbol();
    const MSH_HOME = Symbol();
    const MSH_WAYPOINT = Symbol();

    const UV_HOME = Symbol();
    const UV_SCREEN = Symbol();
    const UV_GIRL_IDLE_00 = Symbol();
    const UV_GIRL_MOVE_00 = Symbol();
    const UV_GIRL_MOVE_01 = Symbol();
    const UV_MONKEY = Symbol();
    const UV_WAYPOINT = Symbol();

    const IDX_SPRITE = Symbol();
    const IDX_MONKEY = Symbol();
    const IDX_HOME = Symbol();

    /*--------------------------------------------------------------------------
        Internal models
    --------------------------------------------------------------------------*/
    const meshes = new Map([
        [MSH_PLAYER, meshXy(-0.375, 0.375, 0, 1.5)],
        [MSH_SCREEN, meshXyScreen($.RES_WIDTH, $.RES_HEIGHT)],
        [MSH_WAYPOINT, [
            -0.375, 0.001, 0.375,
            0.375, 0.001, 0.375,
            -0.375, 0.001, -0.375,
            0.375, 0.001, -0.375,
        ]]
    ]);

    const uvs = new Map([
        [UV_GIRL_IDLE_00, uvRect1024(0, 0, 123, 286)],
        [UV_GIRL_MOVE_00, uvRect1024(123, 0, 123, 286)],
        [UV_GIRL_MOVE_01, uvRect1024(246, 0, 123, 286)],
        [UV_SCREEN, [0, 0, 1, 0, 0, 1, 1, 1]],
        [UV_WAYPOINT, uvRect1024(0, 1024-128-20, 128+20, 128+20)]
    ]);

    const indices = new Map([
        [IDX_SPRITE, [0, 1, 2, 2, 1, 3]],
    ]);

    /*--------------------------------------------------------------------------
        Fetch external models
    --------------------------------------------------------------------------*/
    const externalModels = [
        new ExternalModel("monkey", MSH_MONKEY, UV_MONKEY, IDX_MONKEY),
        new ExternalModel("home", MSH_HOME, UV_HOME, IDX_HOME)
    ];

    await Promise.all(
        externalModels.map(
            extModel => glbFetch(extModel, meshes, uvs, indices)
        )
    );

    /*--------------------------------------------------------------------------
        Process models
    --------------------------------------------------------------------------*/
    /* eslint-disable max-len */
    const modelDef = [
    //  MODEL ID            MESH ID       UV ID            INDEX ID    TEXTURE ID
        $.MDL_GIRL_IDLE_00, MSH_PLAYER,   UV_GIRL_IDLE_00, IDX_SPRITE, $.TEX_GIRL,
        $.MDL_GIRL_MOVE_00, MSH_PLAYER,   UV_GIRL_MOVE_00, IDX_SPRITE, $.TEX_GIRL,
        $.MDL_GIRL_MOVE_01, MSH_PLAYER,   UV_GIRL_MOVE_01, IDX_SPRITE, $.TEX_GIRL,
        $.MDL_FRAMEBUFFER,  MSH_SCREEN,   UV_SCREEN,       IDX_SPRITE, $.TEX_FRAMEBUFFER,
        $.MDL_HOME,         MSH_HOME,     UV_HOME,         IDX_HOME,   $.TEX_HOME,
        $.MDL_MONKEY,       MSH_MONKEY,   UV_MONKEY,       IDX_MONKEY, $.TEX_WOOD,
        $.MDL_UI,           MSH_SCREEN,   UV_SCREEN,       IDX_SPRITE, $.TEX_UI,
        $.MDL_WAYPOINT,     MSH_WAYPOINT, UV_WAYPOINT,     IDX_SPRITE, $.TEX_GIRL
    ];
    /* eslint-enable max-len */

    const meshOffsets = new Map();
    const uvOffsets = new Map();
    const indexOffsets = new Map();
    const modelData = [];
    const indexData = [];

    for (let i = 0; i < modelDef.length;)
    {
        const modelId = modelDef[i++];
        const meshId = modelDef[i++];
        const uvId = modelDef[i++];
        const indexId = modelDef[i++];
        const textureId = modelDef[i++];

        if (!meshOffsets.has(meshId))
        {
            meshOffsets.set(
                meshId,
                pushData(
                    meshes.get(meshId),
                    modelData,
                    SIZEOF_FLOAT32
                )
            );
        }

        if (!uvOffsets.has(uvId))
        {
            uvOffsets.set(
                uvId,
                pushData(
                    uvs.get(uvId),
                    modelData,
                    SIZEOF_FLOAT32
                )
            );
        }

        if (!indexOffsets.has(indexId))
        {
            indexOffsets.set(
                indexId,
                pushData(
                    indices.get(indexId),
                    indexData,
                    SIZEOF_UINT16
                )
            );
        }

        const aOffsets = new Map([
            [$.A_POSITION, meshOffsets.get(meshId)],
            [$.A_TEXCOORD, uvOffsets.get(uvId)]
        ]);

        models.set(
            modelId,
            new Model(
                aOffsets,
                $.BUF_ARR_TEXTURED,
                $.BUF_ELEM_INDEX,
                $.TRIANGLES,
                indexOffsets.get(indexId),
                indices.get(indexId).length
            )
        );

        textureIds.set(modelId, textureId);
    }

    /*--------------------------------------------------------------------------
        Debug
    --------------------------------------------------------------------------*/
    const debugAttrib = new Map([
        [$.A_POSITION, 0]
    ]);

    models.set(
        $.MDL_DEBUG,
        new Model(
            debugAttrib,
            $.BUF_ARR_DYNAMIC,
            $.BUF_ELEM_INDEX_DYNAMIC,
            $.LINES,
            0,
            -1
        )
    );

    meshIds.set($.MDL_DEBUG, MSH_DEBUG);
    indexIds.set($.MDL_DEBUG, IDX_DEBUG);

    /*--------------------------------------------------------------------------
        Push to buffer and finish
    --------------------------------------------------------------------------*/
    Buffer.setDataBind($.BUF_ARR_TEXTURED, new Float32Array(modelData));
    Buffer.setDataBind($.BUF_ELEM_INDEX, new Uint16Array(indexData));

    isLoaded = true;
};

const pushData = (data, dst, byteSize) =>
{
    const offset = dst.length;
    dst.length += data.length;

    for (let i = 0; i < data.length; i++)
    {
        dst[offset + i] = data[i];
    }

    return offset * byteSize;
};

/*------------------------------------------------------------------------------
    Init
------------------------------------------------------------------------------*/
const models = new Map();

const meshIds = new Map();
const indexIds = new Map();
const textureIds = new Map();

let isLoaded = false;
let loadPromise;

const MSH_DEBUG = Symbol();
const IDX_DEBUG = Symbol();

const dynamicMeshes = new Map([
    [MSH_DEBUG, new Float32Array(3 * 100)],
]);

const dynamicIndices = new Map([
    [IDX_DEBUG, new Uint16Array(3 * 1000)],
]);
