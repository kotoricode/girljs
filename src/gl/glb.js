// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md

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
    const dataView = new DataView(data.buffer);
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
    const jsonLen = dataView.getUint32(12, true);

    const jsonStart = 20; // skip header 4 bytes
    const jsonEnd = jsonStart + jsonLen;
    const json = data.subarray(jsonStart, jsonEnd);

    const decoder = new TextDecoder();
    const jsonString = decoder.decode(json);
    const meta = JSON.parse(jsonString);

    /*--------------------------------------------------------------------------
        Process binary
    --------------------------------------------------------------------------*/
    const UINT16_BYTES = 2;
    const FLOAT32_BYTES = 4;
    const VEC2 = 2;
    const VEC3 = 3;

    const binStart = jsonEnd + 8; // skip header 4 bytes
    const [viewMesh, viewUv, viewIdx] = meta.bufferViews;

    const indices = viewIdx.byteLength / UINT16_BYTES;
    const mesh = new Array(indices * VEC3);
    const uv = new Array(indices * VEC2);

    const viewIdxStart = binStart + viewIdx.byteOffset;
    const viewMeshStart = binStart + viewMesh.byteOffset;
    const viewUvStart = binStart + viewUv.byteOffset;

    for (let i = 0; i < indices; i++)
    {
        const idx = dataView.getUint16(viewIdxStart + i * UINT16_BYTES, true);

        const idxF32 = idx * FLOAT32_BYTES;
        const iVec3 = i * VEC3;
        const iVec2 = i * VEC2;

        /*----------------------------------------------------------------------
            Mesh
        ----------------------------------------------------------------------*/
        const mByteOff = viewMeshStart + VEC3 * idxF32;

        for (let j = 0; j < VEC3; j++)
        {
            mesh[iVec3 + j] = dataView.getFloat32(
                mByteOff + FLOAT32_BYTES * j,
                true
            );
        }

        /*----------------------------------------------------------------------
            UV
        ----------------------------------------------------------------------*/
        const uByteOff = viewUvStart + VEC2 * idxF32;

        for (let j = 0; j < VEC2; j++)
        {
            uv[iVec2 + j] = dataView.getFloat32(
                uByteOff + FLOAT32_BYTES * j,
                true
            );
        }
    }

    console.log(window.performance.now() - t1);

    return { mesh, uv };
};
