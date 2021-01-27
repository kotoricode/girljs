// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md

import { SafeMap } from "../utility";

const byteSizes = new SafeMap([
    ["5120", 1], // byte
    ["5121", 1], // ubyte
    ["5122", 2], // short
    ["5123", 2], // ushort
    ["5125", 4], // uint
    ["5126", 4], // float
]);

const compSizes = new SafeMap([
    ["SCALAR", 1],
    ["VEC2", 2],
    ["VEC3", 3],
    ["VEC4", 4],
    ["MAT2", 4],
    ["MAT3", 9],
    ["MAT4", 16],
]);

export const Gltf = {
    async parse(blob)
    {
        const stream = blob.stream();
        const reader = stream.getReader();

        const data = [];
        const jsonData = [];
        const binData = [];

        while (true)
        {
            const { done, value } = await reader.read();

            if (done)
            {
                break;
            }

            data.push(...value);
        }

        const jsonLength = toUint(data.slice(12, 16));
        const jsonStart = 20;
        const jsonEnd = jsonStart + jsonLength;

        jsonData.push(data.slice(jsonStart, jsonEnd));

        const binLength = toUint(data.slice(jsonEnd, jsonEnd + 4));
        const binStart = jsonEnd + 8;
        const binEnd = binStart + binLength;

        binData.push(data.slice(binStart, binEnd));

        console.log(jsonData);
        console.log(binData);
    }
};

const toUint = (bytes) => bytes.reduce((a, b, i) => a += b << (i * 8)) >>> 0;
