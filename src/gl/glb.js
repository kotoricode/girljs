// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md
import { SafeMap } from "../utility";

const toUint = (bytes) => bytes.reduce((a, b, i) => a + (b << i*8)) >>> 0;

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

const decoder = new TextDecoder();

export const Glb = {
    async parse(blob)
    {
        const stream = blob.stream();
        const reader = stream.getReader();
        const data = new Uint8Array(blob.size);
        let offset = 0;

        while (offset !== blob.size)
        {
            const { value } = await reader.read();
            data.set(value, offset);
            offset += value.byteLength;
        }

        // skip 4 bytes magic, 4 bytes version, 4 bytes length
        const jsonLengthBytes = data.subarray(12, 16);
        const jsonLength = toUint(jsonLengthBytes);
        const jsonStart = 20; // skip 4 bytes JSON header
        const jsonEnd = jsonStart + jsonLength;

        const jsonBytes = data.subarray(jsonStart, jsonEnd);
        const jsonString = decoder.decode(jsonBytes);
        const meta = JSON.parse(jsonString);

        const binLengthBytes = data.subarray(jsonEnd, jsonEnd + 4);
        const binLength = toUint(binLengthBytes);
        const binStart = jsonEnd + 8; // skip 4 bytes BIN\0 header
        const binEnd = binStart + binLength;

        const bin = data.subarray(binStart, binEnd);

        return { meta, bin };
    }
};
