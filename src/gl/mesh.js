import * as $ from "../const";
import { SafeMap } from "../utility";

export const Mesh = {
    get(meshId)
    {
        return meshes.get(meshId);
    },
    getUv(uvId)
    {
        return uvs.get(uvId);
    },
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

const rect1024 = (x, y, width, height) =>
{
    return imageRect(x, y, width, height, 1024, 1024);
};

const imageRect = (x, y, width, height, baseWidth, baseHeight) =>
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
    [$.MESH_DEBUG, [0, 0, 0, 2, 2, 2, 0, 0, 0, -2, 2, 2, 0, 0, 0, 2, -2, 2, 0, 0, 0, -2, 2, -2]],
    [$.MESH_GROUND, xz(-2, 2, -2, 2)],
    [$.MESH_PLAYER, xy(-0.4, 0.4, 0, 1.5)],
    [$.MESH_AV_PLAYER, rect(187, 600)],
    [$.MESH_SCREEN, rect($.SCREEN_WIDTH, $.SCREEN_HEIGHT)],
    [$.MESH_TEST, [-1.000000, 1.000000, -1.000000, 1.000000, 1.000000, 1.000000, 1.000000, 1.000000, -1.000000, 1.000000, 1.000000, 1.000000, -1.000000, -1.000000, 1.000000, 1.000000, -1.000000, 1.000000, -1.000000, 1.000000, 1.000000, -1.000000, -1.000000, -1.000000, -1.000000, -1.000000, 1.000000, 1.000000, -1.000000, -1.000000, -1.000000, -1.000000, 1.000000, -1.000000, -1.000000, -1.000000, 1.000000, 1.000000, -1.000000, 1.000000, -1.000000, 1.000000, 1.000000, -1.000000, -1.000000, -1.000000, 1.000000, -1.000000, 1.000000, -1.000000, -1.000000, -1.000000, -1.000000, -1.000000, -1.000000, 1.000000, -1.000000, -1.000000, 1.000000, 1.000000, 1.000000, 1.000000, 1.000000, 1.000000, 1.000000, 1.000000, -1.000000, 1.000000, 1.000000, -1.000000, -1.000000, 1.000000, -1.000000, 1.000000, 1.000000, -1.000000, 1.000000, -1.000000, -1.000000, -1.000000, -1.000000, 1.000000, -1.000000, -1.000000, 1.000000, -1.000000, 1.000000, -1.000000, -1.000000, 1.000000, 1.000000, 1.000000, -1.000000, 1.000000, 1.000000, 1.000000, 1.000000, -1.000000, 1.000000, -1.000000, 1.000000, -1.000000, 1.000000, 1.000000, -1.000000, 1.000000, -1.000000, -1.000000, ]]
]);

const rectScreen = [0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1];

const uvs = new SafeMap([
    [$.UV_GIRL_00, imageRect(0, 0, 356, 1170, 356, 1170)],
    [$.UV_BRAID_00, rect1024(0, 10, 136, 136)],
    [$.UV_BRAID_02, rect1024(256, 10, 136, 136)],
    [$.UV_BRAID_04, rect1024(512, 10, 136, 136)],
    [$.UV_BRAID_06, rect1024(768, 10, 136, 136)],
    [$.UV_BRAID_08, rect1024(128, 158, 136, 136)],
    [$.UV_BRAID_10, rect1024(384, 158, 136, 136)],
    [$.UV_BRAID_12, rect1024(640, 158, 136, 136)],
    [$.UV_BRAID_14, rect1024(0, 309, 136, 136)],
    [$.UV_BRAID_16, rect1024(256, 309, 136, 136)],
    [$.UV_BRAID_18, rect1024(512, 309, 136, 136)],
    [$.UV_BRAID_20, rect1024(768, 309, 136, 136)],
    [$.UV_BRAID_22, rect1024(128, 461, 136, 136)],
    [$.UV_BRAID_24, rect1024(384, 461, 136, 136)],
    [$.UV_BRAID_26, rect1024(640, 461, 136, 136)],
    [$.UV_GROUND, imageRect(94, 97, 256, 256, 512, 512)],
    [$.UV_SCREEN, rectScreen],
    [$.UV_TEXT, rectScreen],
    [$.UV_BUBBLE, rectScreen],
    [$.UV_TEST,  [0.875000, 0.500000, 0.625000, 0.750000, 0.625000, 0.500000, 0.625000, 0.750000, 0.375000, 1.000000, 0.375000, 0.750000, 0.625000, 0.000000, 0.375000, 0.250000, 0.375000, 0.000000, 0.375000, 0.500000, 0.125000, 0.750000, 0.125000, 0.500000, 0.625000, 0.500000, 0.375000, 0.750000, 0.375000, 0.500000, 0.625000, 0.250000, 0.375000, 0.500000, 0.375000, 0.250000, 0.875000, 0.500000, 0.875000, 0.750000, 0.625000, 0.750000, 0.625000, 0.750000, 0.625000, 1.000000, 0.375000, 1.000000, 0.625000, 0.000000, 0.625000, 0.250000, 0.375000, 0.250000, 0.375000, 0.500000, 0.375000, 0.750000, 0.125000, 0.750000, 0.625000, 0.500000, 0.625000, 0.750000, 0.375000, 0.750000, 0.625000, 0.250000, 0.625000, 0.500000, 0.375000, 0.500000, ]]
]);
