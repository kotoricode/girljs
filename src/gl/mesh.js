import * as $ from "../const";
import { SafeMap } from "../utility";

export const getMesh = (meshId) =>
{
    return meshData.get(meshId);
};

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

const meshData = new SafeMap([
    [$.MESH_GROUND, getXz(-2, 2, -2, 2)],
    [$.MESH_PLAYER, getXy(-0.4, 0.4, 0, 1.5)],
]);
