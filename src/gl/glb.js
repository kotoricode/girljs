// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md

import { FLOAT } from "../const";

const toUint16 = (array, offset) => (
    array[offset] +
    array[offset+1] * 256
);

const toUint32 = (array, offset) => (
    array[offset] +
    array[offset+1] * 256 +
    array[offset+2] * 65536 +
    array[offset+3] * 16777216
);

const decoder = new TextDecoder();

const USHORT_BYTES = Uint16Array.BYTES_PER_ELEMENT;
const FLOAT32_BYTES = Float32Array.BYTES_PER_ELEMENT;
const VEC2 = 2;
const VEC3 = 3;

export const parseGlb = async(blob) =>
{
    console.log(blob);
    const t1 = window.performance.now();

    /*--------------------------------------------------------------------------
        Read glb
    --------------------------------------------------------------------------*/
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

    reader.cancel();

    /*--------------------------------------------------------------------------
        Get JSON
    --------------------------------------------------------------------------*/
    const jsonLen = toUint32(data, 12);

    const jsonStart = 20; // skip header 4 bytes
    const jsonEnd = jsonStart + jsonLen;
    const json = data.subarray(jsonStart, jsonEnd);

    const jsonString = decoder.decode(json);
    const meta = JSON.parse(jsonString);

    /*--------------------------------------------------------------------------
        Process binary
    --------------------------------------------------------------------------*/
    const binStart = jsonEnd + 8; // skip header 4 bytes
    const [viewMesh, viewUv, viewIdx] = meta.bufferViews;

    const meshF32 = new Float32Array(viewIdx.byteLength * VEC3);
    const meshDataView = new DataView(meshF32.buffer);

    const uvF32 = new Float32Array(viewIdx.byteLength * VEC2);
    const uvDataView = new DataView(uvF32.buffer);

    const indices = viewIdx.byteLength / USHORT_BYTES;

    for (let i = 0; i < indices; i++)
    {
        const idx = toUint16(
            data,
            binStart + viewIdx.byteOffset + i * USHORT_BYTES
        );

        const iF32 = i * FLOAT32_BYTES;
        const idxF32 = idx * FLOAT32_BYTES;

        /*----------------------------------------------------------------------
            Mesh
        ----------------------------------------------------------------------*/
        const m0Off = binStart + viewMesh.byteOffset + VEC3 * idxF32;
        const m1Off = m0Off + FLOAT32_BYTES;
        const m2Off = m1Off + FLOAT32_BYTES;

        const m0 = toUint32(data, m0Off);
        const m1 = toUint32(data, m1Off);
        const m2 = toUint32(data, m2Off);

        const m0IdxOff = iF32 * 3;
        const m1IdxOff = m0IdxOff + FLOAT32_BYTES;
        const m2IdxOff = m1IdxOff + FLOAT32_BYTES;

        meshDataView.setUint32(m0IdxOff, m0, true);
        meshDataView.setUint32(m1IdxOff, m1, true);
        meshDataView.setUint32(m2IdxOff, m2, true);

        /*----------------------------------------------------------------------
            UV
        ----------------------------------------------------------------------*/
        const u0Off = binStart + viewUv.byteOffset + VEC2 * idxF32;
        const u1Off = u0Off + FLOAT32_BYTES;

        const u0 = toUint32(data, u0Off);
        const u1 = toUint32(data, u1Off);

        const u0IdxOff = iF32 * 2;
        const u1IdxOff = u0IdxOff + FLOAT32_BYTES;

        uvDataView.setUint32(u0IdxOff, u0, true);
        uvDataView.setUint32(u1IdxOff, u1, true);
    }

    console.log(window.performance.now() - t1);

    return {
        mesh: Array.from(meshF32),
        uv: Array.from(uvF32)
    };
};
