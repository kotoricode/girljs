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

export const Glb = {
    async parse(blob)
    {
        const stream = blob.stream();
        const reader = stream.getReader();
        const data = [];

        while (true)
        {
            const chunk = await reader.read();

            if (chunk.done)
            {
                break;
            }

            data.push(...chunk.value);
        }

        // skip 4 bytes magic, 4 bytes version, 4 bytes length
        const jsonLengthBytes = data.slice(12, 16);
        const jsonLength = toUint(jsonLengthBytes);
        const jsonStart = 20; // skip 4 bytes JSON header
        const jsonEnd = jsonStart + jsonLength;

        const jsonBytes = data.slice(jsonStart, jsonEnd);
        const json = JSON.parse(String.fromCharCode(...jsonBytes));

        const binLengthBytes = data.slice(jsonEnd, jsonEnd + 4);
        const binLength = toUint(binLengthBytes);
        const binStart = jsonEnd + 8; // skip 4 bytes BIN\0 header
        const binEnd = binStart + binLength;

        const bin = data.slice(binStart, binEnd);

        for (let i = 0; i < 900000000;)
        {
            i++;
        }

        console.log("parse done");

        return { json, bin };
    }
};

const toUint = (bytes) => bytes.reduce((a, b, i) => a + (b << i*8)) >>> 0;
