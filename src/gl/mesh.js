import * as $ from "../const";
import { SafeMap } from "../utility";

import { a } from "../data/test.mesh";

export const Mesh = {
    get(meshId)
    {
        return meshes.get(meshId);
    }
};

const xy = (minX, maxX, minY, maxY) => [
    minX, minY, 0,
    maxX, minY, 0,
    minX, maxY, 0,
    minX, maxY, 0,
    maxX, minY, 0,
    maxX, maxY, 0,
];

const rect = (width, height) =>
{
    const x = width / $.SCREEN_WIDTH;
    const y = height / $.SCREEN_HEIGHT;

    return xy(-x, x, -y, y);
};

const xz = (minX, maxX, minZ, maxZ) => [
    minX, 0, maxZ,
    maxX, 0, maxZ,
    minX, 0, minZ,
    minX, 0, minZ,
    maxX, 0, maxZ,
    maxX, 0, minZ,
];

const meshes = new SafeMap([
    [$.MESH_DEBUG, [0, 0, 0, 2, 2, 2, 0, 0, 0, -2, 2, 2, 0, 0, 0, 2, -2, 2, 0, 0, 0, -2, 2, -2]],
    [$.MESH_GROUND, xz(-2, 2, -2, 2)],
    [$.MESH_PLAYER, xy(-0.4, 0.4, 0, 1.5)],
    [$.MESH_AVATAR_PLAYER, rect(187, 600)],
    [$.MESH_SCREEN, rect($.SCREEN_WIDTH, $.SCREEN_HEIGHT)],
    [$.MESH_TEST, a]
]);
