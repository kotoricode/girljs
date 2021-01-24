import * as $ from "../const";
import { SafeMap } from "../utility";

export const Mesh = {
    get(meshId)
    {
        return meshes.get(meshId);
    }
};

const xy3 = (minX, maxX, minY, maxY) =>
{
    return [
        minX, minY, 0,
        maxX, minY, 0,
        minX, maxY, 0,
        minX, maxY, 0,
        maxX, minY, 0,
        maxX, maxY, 0,
    ];
};

const xy2Dim = (width, height) =>
{
    const x = width / $.SCREEN_WIDTH;
    const y = height / $.SCREEN_HEIGHT;

    return [
        -x, -y, 0,
        x, -y, 0,
        -x, y, 0,
        -x, y, 0,
        x, -y, 0,
        x, y, 0,
    ];
};

const xz3 = (minX, maxX, minZ, maxZ) =>
{
    return [
        minX, 0, maxZ,
        maxX, 0, maxZ,
        minX, 0, minZ,
        minX, 0, minZ,
        maxX, 0, maxZ,
        maxX, 0, minZ,
    ];
};

const meshes = new SafeMap([
    [$.MESH_GROUND, xz3(-2, 2, -2, 2)],
    [$.MESH_PLAYER, xy3(-0.4, 0.4, 0, 1.5)],
    [$.MESH_AVATAR_PLAYER,   xy2Dim(187, 600)],
    [$.MESH_SCREEN, xy2Dim($.SCREEN_WIDTH, $.SCREEN_HEIGHT)]
]);
