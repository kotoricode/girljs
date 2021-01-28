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

        const idx = new Array(viewIdx.byteLength / 6);

        const objXyz = {
            f32: new Float32Array(9 * idx.length),
            array: new Array(viewMesh.byteLength / 12)
        };

        const objUv = {
            f32: new Float32Array(6 * idx.length),
            array: new Array(viewUv.byteLength / 8)
        };

        for (let i = 0, j = 0; i < viewMesh.byteLength; i += 12)
        {
            objXyz.array[j++] = [
                toUint(bin.subarray(i, i+4)),
                toUint(bin.subarray(i+4, i+8)),
                toUint(bin.subarray(i+8, i+12))
            ];
        }

        const viewUvEnd = viewUv.byteOffset + viewUv.byteLength;

        for (let i = viewUv.byteOffset, j = 0; i < viewUvEnd; i += 8)
        {
            objUv.array[j++] = [
                toUint(bin.subarray(i, i+4)),
                toUint(bin.subarray(i+4, i+8))
            ];
        }

        const viewIdxEnd = viewIdx.byteLength + viewIdx.byteOffset;

        for (let i = viewIdx.byteOffset, j = 0; i < viewIdxEnd; i += 6)
        {
            idx[j++] = [
                toUint(bin.subarray(i, i+2)),
                toUint(bin.subarray(i+2, i+4)),
                toUint(bin.subarray(i+4, i+6))
            ];
        }

        for (const obj of [objXyz, objUv])
        {
            let byteOffset = 0;
            const view = new DataView(obj.f32.buffer);

            for (const verticesIdx of idx)
            {
                for (const vertexIdx of verticesIdx)
                {
                    for (const coord of obj.array[vertexIdx])
                    {
                        view.setUint32(byteOffset, coord, true);
                        byteOffset += Float32Array.BYTES_PER_ELEMENT;
                    }
                }
            }
        }

        return {
            floatXyz: Array.from(objXyz.f32),
            floatUv: Array.from(objUv.f32)
        };
    }
};
