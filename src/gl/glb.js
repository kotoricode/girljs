// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md

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

    const decoder = new TextDecoder();
    const jsonString = decoder.decode(json);
    const meta = JSON.parse(jsonString);

    /*--------------------------------------------------------------------------
        Process binary
    --------------------------------------------------------------------------*/
    const USHORT_BYTES = Uint16Array.BYTES_PER_ELEMENT;
    const FLOAT32_BYTES = Float32Array.BYTES_PER_ELEMENT;
    const VEC2 = 2;
    const VEC3 = 3;

    const binStart = jsonEnd + 8; // skip header 4 bytes
    const [viewMesh, viewUv, viewIdx] = meta.bufferViews;

    const f32 = new Float32Array(1);
    const dataView = new DataView(f32.buffer);

    const indices = viewIdx.byteLength / USHORT_BYTES;
    const mesh = new Array(indices * VEC3);
    const uv = new Array(indices * VEC2);

    for (let i = 0; i < indices; i++)
    {
        const idx = toUint16(
            data,
            binStart + viewIdx.byteOffset + i * USHORT_BYTES
        );

        const idxF32 = idx * FLOAT32_BYTES;
        const iVec3 = i * VEC3;
        const iVec2 = i * VEC2;

        /*----------------------------------------------------------------------
            Mesh
        ----------------------------------------------------------------------*/
        let mByteOff = binStart + viewMesh.byteOffset + VEC3 * idxF32;

        for (let j = 0; j < VEC3; j++)
        {
            const value = toUint32(data, mByteOff);
            dataView.setUint32(0, value, true);
            mesh[iVec3 + j] = f32[0];
            mByteOff += FLOAT32_BYTES;
        }

        /*----------------------------------------------------------------------
            UV
        ----------------------------------------------------------------------*/
        let uByteOff = binStart + viewUv.byteOffset + VEC2 * idxF32;

        for (let j = 0; j < VEC2; j++)
        {
            const value = toUint32(data, uByteOff);
            dataView.setUint32(0, value, true);
            uv[iVec2 + j] = f32[0];
            uByteOff += FLOAT32_BYTES;
        }
    }

    console.log(window.performance.now() - t1);

    return { mesh, uv };
};
