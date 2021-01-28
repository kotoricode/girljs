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

        const viewMesh = meta.bufferViews[0]; // 4 byte float
        const viewUv = meta.bufferViews[1]; // 4 byte float
        const viewIdx = meta.bufferViews[2]; // 2 byte ushort

        //console.log(viewMesh);
        //console.log(viewUv);
        //console.log(viewIdx);

        const xyz = [];
        const uv = [];
        const idx = [];

        for (let i = 0; i < viewMesh.byteLength;)
        {
            const arr = [
                [bin[i++], bin[i++], bin[i++], bin[i++]],
                [bin[i++], bin[i++], bin[i++], bin[i++]],
                [bin[i++], bin[i++], bin[i++], bin[i++]]
            ];

            xyz.push(arr);
        }

        for (let i = viewUv.byteOffset; i < viewUv.byteOffset + viewUv.byteLength;)
        {
            const arr = [
                [bin[i++], bin[i++], bin[i++], bin[i++]],
                [bin[i++], bin[i++], bin[i++], bin[i++]]
            ];

            uv.push(arr);
        }

        for (let i = viewIdx.byteOffset; i < viewIdx.byteLength + viewIdx.byteOffset;)
        {
            const arr = [
                toUint([bin[i++], bin[i++]]),
                toUint([bin[i++], bin[i++]]),
                toUint([bin[i++], bin[i++]])
            ];

            idx.push(arr);
        }

        const floatXyz = new Float32Array(3 * 3 * idx.length);
        const floatXyzView = new DataView(floatXyz.buffer);
        let byteOffset = 0;

        for (const verticesIdx of idx)
        {
            for (const vertexIdx of verticesIdx)
            {
                for (const coord of xyz[vertexIdx])
                {
                    for (const byte of coord)
                    {
                        floatXyzView.setUint8(byteOffset++, byte);
                    }
                }
            }
        }

        const floatUv = new Float32Array(2 * 3 * idx.length);
        const floatUvView = new DataView(floatUv.buffer);
        byteOffset = 0;

        for (const verticesIdx of idx)
        {
            for (const vertexIdx of verticesIdx)
            {
                for (const coord of uv[vertexIdx])
                {
                    for (const byte of coord)
                    {
                        floatUvView.setUint8(byteOffset++, byte);
                    }
                }
            }
        }

        return {
            floatXyz: Array.from(floatXyz),
            floatUv: Array.from(floatUv)
        };
    }
};
