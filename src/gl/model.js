import * as $ from "../const";
import {
    SIZEOF_FLOAT32,
    SIZEOF_UINT16,
    SafeMap,
    SettableFloat32Array
} from "../utility";
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
        maxX, minY,
    ];
};

/*------------------------------------------------------------------------------
    Model
------------------------------------------------------------------------------*/
export class Model
{
    constructor(aOffsets, bufferId, drawMode, drawOffset, drawSize)
    {
        this.aOffsets = aOffsets;
        this.bufferId = bufferId;
        this.drawMode = drawMode;
        this.drawOffset = drawOffset;
        this.drawSize = drawSize;
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

class TexturedModel extends Model
{
    constructor(aOffsets, bufferId, drawMode, textureId, drawOffset, drawSize)
    {
        super(aOffsets, bufferId, drawMode, drawOffset, drawSize);
        this.textureId = textureId;

        Object.freeze(this);
    }
}

class DynamicModel extends Model
{
    constructor(aOffsets, bufferId, drawMode, meshId, drawOffset, drawSize)
    {
        super(aOffsets, bufferId, drawMode, drawOffset, drawSize);
        this.meshId = meshId;

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
    const stream = blob.stream();
    const reader = stream.getReader();
    const data = new Uint8Array(blob.size);
    const dataView = new DataView(data.buffer);
    let offset = 0;

    while (offset !== blob.size)
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

    const jsonStart = 20; // skip header 4 bytes
    const jsonEnd = jsonStart + jsonLen;
    const json = data.subarray(jsonStart, jsonEnd);

    const decoder = new TextDecoder();
    const jsonString = decoder.decode(json);
    const meta = JSON.parse(jsonString);

    /*--------------------------------------------------------------------------
        Process binary
    --------------------------------------------------------------------------*/
    const binStart = jsonEnd + 8; // skip header 4 bytes
    const [viewMesh, viewUv, viewIdx] = meta.bufferViews;

    const readFloat32 = (binOffset) => dataView.getFloat32(binOffset, true);
    const readUint16 = (binOffset) => dataView.getUint16(binOffset, true);

    meshes.set(
        extModel.meshId,
        glbRead(readFloat32, viewMesh, binStart, SIZEOF_FLOAT32)
    );

    uvs.set(
        extModel.uvId,
        glbRead(readFloat32, viewUv, binStart, SIZEOF_FLOAT32)
    );

    indices.set(
        extModel.indexId,
        glbRead(readUint16, viewIdx, binStart, SIZEOF_UINT16)
    );
};

const glbRead = (func, view, binStart, sizeOf) =>
{
    const array = new Array(view.byteLength / sizeOf);
    const viewStart = binStart + view.byteOffset;

    for (let i = 0; i < array.length; i++)
    {
        array[i] = func(viewStart + i * sizeOf);
    }

    return array;
};

const buildModels = async() =>
{
    const MSH_PLAYER = Symbol();
    const MSH_SCREEN = Symbol();
    const MSH_TEST = Symbol();
    const MSH_MONKEY = Symbol();
    const MSH_HOME = Symbol();

    const UV_TEST = Symbol();
    const UV_HOME = Symbol();
    const UV_SCREEN = Symbol();
    const UV_GIRL_IDLE_00 = Symbol();
    const UV_GIRL_MOVE_00 = Symbol();
    const UV_GIRL_MOVE_01 = Symbol();
    const UV_MONKEY = Symbol();

    const IDX_SPRITE = Symbol();
    const IDX_LINE_BOX = Symbol();
    const IDX_TEST = Symbol();
    const IDX_MONKEY = Symbol();
    const IDX_HOME = Symbol();

    /*--------------------------------------------------------------------------
        Internal meshes, UVs
    --------------------------------------------------------------------------*/
    const meshes = new SafeMap([
        [MSH_PLAYER, meshXy(-0.375, 0.375, 0, 1.5)],
        [MSH_SCREEN, meshXyScreen($.RES_WIDTH, $.RES_HEIGHT)],
    ]);

    const uvs = new SafeMap([
        [UV_GIRL_IDLE_00, uvRect(0, 0, 123, 286, 1024, 1024)],
        [UV_GIRL_MOVE_00, uvRect(123, 0, 123, 286, 1024, 1024)],
        [UV_GIRL_MOVE_01, uvRect(246, 0, 123, 286, 1024, 1024)],
        [UV_SCREEN, [0, 0, 1, 0, 0, 1, 1, 1]],
    ]);

    const indices = new SafeMap([
        [IDX_SPRITE, [0, 1, 2, 2, 1, 3]],
        [IDX_LINE_BOX, [0, 1, 1, 2, 2, 3, 3, 0]]
    ]);

    /*--------------------------------------------------------------------------
        Download external models
    --------------------------------------------------------------------------*/
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

    const externalModels = [
        new ExternalModel("mesh", MSH_TEST, UV_TEST, IDX_TEST),
        new ExternalModel("monkey", MSH_MONKEY, UV_MONKEY, IDX_MONKEY),
        new ExternalModel("home", MSH_HOME, UV_HOME, IDX_HOME)
    ];

    await Promise.all(
        externalModels.map(
            extModel => glbFetch(extModel, meshes, uvs, indices)
        )
    );

    /*--------------------------------------------------------------------------
        Build models from mesh + UV + texture information
    --------------------------------------------------------------------------*/
    const modelData = [];
    const indexData = [];

    /* eslint-disable max-len */
    const modelDef = [
    //  MODEL ID            MESH ID     UV ID            INDEX IDX   TEXTURE ID
        $.MDL_GIRL_IDLE_00, MSH_PLAYER, UV_GIRL_IDLE_00, IDX_SPRITE, $.TEX_GIRL,
        $.MDL_GIRL_MOVE_00, MSH_PLAYER, UV_GIRL_MOVE_00, IDX_SPRITE, $.TEX_GIRL,
        $.MDL_GIRL_MOVE_01, MSH_PLAYER, UV_GIRL_MOVE_01, IDX_SPRITE, $.TEX_GIRL,
        $.MDL_FB,           MSH_SCREEN, UV_SCREEN,       IDX_SPRITE, $.TEX_FB,
        $.MDL_TEXT,         MSH_SCREEN, UV_SCREEN,       IDX_SPRITE, $.TEX_UI_TEXT,
        $.MDL_BUBBLE,       MSH_SCREEN, UV_SCREEN,       IDX_SPRITE, $.TEX_UI_BUBBLE,
        $.MDL_HOME,         MSH_HOME,   UV_HOME,         IDX_HOME,   $.TEX_HOME,
        $.MDL_TEST,         MSH_TEST,   UV_TEST,         IDX_TEST,   $.TEX_WORLD,
        $.MDL_MONKEY,       MSH_MONKEY, UV_MONKEY,       IDX_MONKEY, $.TEX_WOOD,
    ];
    /* eslint-enable max-len */

    const pushData = (data, destination, byteSize) =>
    {
        const offset = destination.length;
        destination.length += data.length;

        for (let i = 0; i < data.length; i++)
        {
            destination[offset + i] = data[i];
        }

        return offset * byteSize;
    };

    // Local build caches
    const meshOffsets = new SafeMap();
    const uvOffsets = new SafeMap();
    const indexOffsets = new SafeMap();

    for (let i = 0; i < modelDef.length;)
    {
        const modelId = modelDef[i++];
        const meshId = modelDef[i++];
        const uvId = modelDef[i++];
        const indexId = modelDef[i++];
        const textureId = modelDef[i++];

        if (!meshOffsets.has(meshId))
        {
            const meshOffset = pushData(
                meshes.get(meshId),
                modelData,
                SIZEOF_FLOAT32
            );

            meshOffsets.set(meshId, meshOffset);
        }

        if (!uvOffsets.has(uvId))
        {
            const uvOffset = pushData(
                uvs.get(uvId),
                modelData,
                SIZEOF_FLOAT32
            );

            uvOffsets.set(uvId, uvOffset);
        }

        if (!indexOffsets.has(indexId))
        {
            const idxOffset = pushData(
                indices.get(indexId),
                indexData,
                SIZEOF_UINT16
            );

            indexOffsets.set(indexId, idxOffset);
        }

        const aOffsets = new SafeMap([
            [$.A_POSITION, meshOffsets.get(meshId)],
            [$.A_TEXCOORD, uvOffsets.get(uvId)]
        ]);

        models.set(
            modelId,
            new TexturedModel(
                aOffsets,
                $.BUF_ARR_MODEL,
                $.TRIANGLES,
                textureId,
                indexOffsets.get(indexId),
                indices.get(indexId).length
            )
        );
    }

    /*--------------------------------------------------------------------------
        Debug
    --------------------------------------------------------------------------*/
    const debugAttrib = new SafeMap([
        [$.A_POSITION, 0]
    ]);

    const debugIdx = indices.get(IDX_LINE_BOX);

    const debugIdxOffset = pushData(
        debugIdx,
        indexData,
        SIZEOF_UINT16
    );

    models.set(
        $.MDL_DEBUG,
        new DynamicModel(
            debugAttrib,
            $.BUF_ARR_DEBUG,
            $.LINES,
            MSH_DEBUG,
            debugIdxOffset,
            debugIdx.length
        )
    );

    /*--------------------------------------------------------------------------
        Push to buffer and finish
    --------------------------------------------------------------------------*/
    Buffer.bind($.BUF_ARR_MODEL);
    Buffer.setData($.BUF_ARR_MODEL, new Float32Array(modelData));
    Buffer.unbind($.BUF_ARR_MODEL);

    Buffer.bind($.BUF_ELEM_ARRAY_INDEX);
    Buffer.setData($.BUF_ELEM_ARRAY_INDEX, new Uint16Array(indexData));
    Buffer.unbind($.BUF_ELEM_ARRAY_INDEX);

    isLoaded = true;
};

/*------------------------------------------------------------------------------
    Init
------------------------------------------------------------------------------*/
const models = new SafeMap();
let isLoaded = false;
let loadPromise;

const MSH_DEBUG = Symbol();
const IDX_DEBUG = Symbol();

const dynamicMeshes = new SafeMap([
    [MSH_DEBUG, new SettableFloat32Array(1000)],
]);

const dynamicIndices= new SafeMap([
    [IDX_DEBUG, new SettableFloat32Array(1000)],
]);
