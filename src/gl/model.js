import * as $ from "../const";
import { FLOAT32_BYTES, SafeMap, SettableFloat32Array, UINT16_BYTES } from "../utility";
import { Buffer } from "./buffer";
import { parseGlb } from "./glb";

/*------------------------------------------------------------------------------
    Consts
------------------------------------------------------------------------------*/
const MSH_DEBUG = Symbol();
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
        maxX, minY,
    ];
};

/*------------------------------------------------------------------------------
    Model
------------------------------------------------------------------------------*/
export class Model
{
    constructor(attributes, bufferId, drawMode, drawOffset, drawSize)
    {
        this.attributes = attributes;
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
    constructor(attributes, bufferId, drawMode, textureId, drawOffset, drawSize)
    {
        super(attributes, bufferId, drawMode, drawOffset, drawSize);
        this.textureId = textureId;

        Object.freeze(this);
    }
}

class DynamicModel extends Model
{
    constructor(attributes, bufferId, drawMode, meshId, drawOffset, drawSize)
    {
        super(attributes, bufferId, drawMode, drawOffset, drawSize);
        this.meshId = meshId;

        Object.freeze(this);
    }
}

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
        [UV_SCREEN, [0, 0, 1, 0, 0, 1, 1, 1]],
    ]);

    const idxs = new SafeMap([
        [IDX_SPRITE, [0, 1, 2, 2, 1, 3]],
        [IDX_LINE_BOX, [0, 1, 1, 2, 2, 3, 3, 0]]
    ]);

    /*--------------------------------------------------------------------------
        Download external models
    --------------------------------------------------------------------------*/
    class ExternalModelInfo
    {
        constructor(fileName, meshId, uvId, idxId)
        {
            this.url = `/mdl/${fileName}.glb`;
            this.meshId = meshId;
            this.uvId = uvId;
            this.idxId = idxId;

            Object.freeze(this);
        }
    }

    const externalModels = [
        new ExternalModelInfo("mesh", MSH_TEST, UV_TEST, IDX_TEST),
        new ExternalModelInfo("monkey", MSH_MONKEY, UV_MONKEY, IDX_MONKEY),
        new ExternalModelInfo("home", MSH_HOME, UV_HOME, IDX_HOME)
    ];

    await Promise.all(
        externalModels.map(extModel => (async() =>
        {
            const response = await window.fetch(extModel.url);
            const blob = await response.blob();
            const { mesh, uv, idx } = await parseGlb(blob);

            meshes.set(extModel.meshId, mesh);
            uvs.set(extModel.uvId, uv);
            idxs.set(extModel.idxId, idx);
        })())
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
    const idxOffsets = new SafeMap();

    for (let i = 0; i < modelDef.length;)
    {
        const modelId = modelDef[i++];
        const meshId = modelDef[i++];
        const uvId = modelDef[i++];
        const idxId = modelDef[i++];
        const textureId = modelDef[i++];

        if (!meshOffsets.has(meshId))
        {
            const meshOffset = pushData(
                meshes.get(meshId),
                modelData,
                FLOAT32_BYTES
            );

            meshOffsets.set(meshId, meshOffset);
        }

        if (!uvOffsets.has(uvId))
        {
            const uvOffset = pushData(
                uvs.get(uvId),
                modelData,
                FLOAT32_BYTES
            );

            uvOffsets.set(uvId, uvOffset);
        }

        if (!idxOffsets.has(idxId))
        {
            const idxOffset = pushData(
                idxs.get(idxId),
                indexData,
                UINT16_BYTES
            );

            idxOffsets.set(idxId, idxOffset);
        }

        const attributes = new SafeMap([
            [$.A_POSITION, meshOffsets.get(meshId)],
            [$.A_TEXCOORD, uvOffsets.get(uvId)]
        ]);

        models.set(
            modelId,
            new TexturedModel(
                attributes,
                $.BUF_ARR_MODEL,
                $.TRIANGLES,
                textureId,
                idxOffsets.get(idxId),
                idxs.get(idxId).length
            )
        );
    }

    /*--------------------------------------------------------------------------
        Debug
    --------------------------------------------------------------------------*/
    const debugAttrib = new SafeMap([
        [$.A_POSITION, 0]
    ]);

    const debugIdx = idxs.get(IDX_LINE_BOX);
    const debugIdxOffset = pushData(
        debugIdx,
        indexData,
        UINT16_BYTES
    );

    models.set($.MDL_DEBUG, new DynamicModel(
        debugAttrib,
        $.BUF_ARR_DEBUG,
        $.LINES,
        MSH_DEBUG,
        debugIdxOffset,
        debugIdx.length
    ));

    /*--------------------------------------------------------------------------
        Push to buffer and finish
    --------------------------------------------------------------------------*/
    Buffer.bind($.BUF_ARR_MODEL);
    Buffer.setData($.BUF_ARR_MODEL, new Float32Array(modelData));
    Buffer.unbind($.BUF_ARR_MODEL);
    isLoaded = true;

    Buffer.bind($.BUF_ELEM_ARRAY_INDEX);
    Buffer.setData($.BUF_ELEM_ARRAY_INDEX, new Uint16Array(indexData));
    Buffer.unbind($.BUF_ELEM_ARRAY_INDEX);
};

/*------------------------------------------------------------------------------
    Init
------------------------------------------------------------------------------*/
const models = new SafeMap();
let isLoaded = false;
let loadPromise;

const dynamicMeshes = new SafeMap([
    [MSH_DEBUG, new SettableFloat32Array(3 * 2 * 12 * 10)],
]);
