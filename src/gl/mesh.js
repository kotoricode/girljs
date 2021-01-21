import * as $ from "../const";
import { SafeMap } from "../utility";

export const Mesh = {
    get(meshId)
    {
        return meshes.get(meshId);
    }
};

const getXy3 = (minX, maxX, minY, maxY) =>
{
    return [
        minX, minY, 0,
        maxX, minY, 0,
        minX, maxY, 0,
        maxX, maxY, 0,
    ];
};

const getXy2Dim = (width, height) =>
{
    const x = width / $.SCREEN_WIDTH;
    const y = height / $.SCREEN_HEIGHT;

    return [
        -x, -y,
        x, -y,
        -x, y,
        x, y,
    ];
};

const getXz3 = (minX, maxX, minZ, maxZ) =>
{
    return [
        minX, 0, maxZ,
        maxX, 0, maxZ,
        minX, 0, minZ,
        maxX, 0, minZ,
    ];
};

const meshes = new SafeMap([
    [$.MESH_GROUND, getXz3(-2, 2, -2, 2)],
    [$.MESH_PLAYER, getXy3(-0.4, 0.4, 0, 1.5)],
    [$.MESH_GIRL,   getXy2Dim(187, 600)],
    [$.MESH_SCREEN, [-1,1, -1,-1, 1,-1, 1,-1, 1,1, -1,1]]
]);
