import * as $ from "../const";
import { BufferData } from "../buffer-data";
import { BufferArray } from "./buffer";
import { Texture } from "./texture";

const getXy = (minX, maxX, minY, maxY) =>
{
    return [
        minX, minY, 0,
        maxX, minY, 0,
        minX, maxY, 0,
        maxX, maxY, 0,
    ];
};

const getXz = (minX, maxX, minZ, maxZ) =>
{
    return [
        minX, 0, maxZ,
        maxX, 0, maxZ,
        minX, 0, minZ,
        maxX, 0, minZ,
    ];
};

export const getMesh = (meshId) =>
{
    if (meshData.has(meshId))
    {
        return meshData.get(meshId);
    }

    throw meshId;
};

const meshData = new Map([
    [$.MESH_GROUND, getXz(-2, 2, -2, 2)],
    [$.MESH_PLAYER, getXy(-0.4, 0.4, 0, 1.5)],
]);
