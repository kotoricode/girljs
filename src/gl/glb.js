// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md

export const parseGlb = async(blob) =>
{
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
    const binStart = jsonEnd + 8; // skip header 4 bytes
    const [viewMesh, viewUv, viewIdx] = meta.bufferViews;

    const numIdx = viewIdx.byteLength / UINT16_BYTES;
    const mesh = new Array(numIdx * VEC3);
    const uv = new Array(numIdx * VEC2);

    const viewIdxStart = binStart + viewIdx.byteOffset;
    const viewMeshStart = binStart + viewMesh.byteOffset;
    const viewUvStart = binStart + viewUv.byteOffset;

    for (let i = 0; i < numIdx; i++)
    {
        const idx = dataView.getUint16(viewIdxStart + i * UINT16_BYTES, true);
        const idxF32 = idx * FLOAT32_BYTES;
        readFloat(dataView, viewMeshStart, mesh, VEC3, i, idxF32);
        readFloat(dataView, viewUvStart, uv, VEC2, i, idxF32);
    }

    return { mesh, uv };
};

const readFloat = (dataView, viewOffset, dstArray, dataType, i, idxF32) =>
{
    const viewByteOffset = viewOffset + idxF32 * dataType;
    const dstIdx = i * dataType;

    for (let j = 0; j < dataType; j++)
    {
        dstArray[dstIdx + j] = dataView.getFloat32(
            viewByteOffset + j * FLOAT32_BYTES,
            true
        );
    }
};

const UINT16_BYTES = 2;
const FLOAT32_BYTES = 4;
const VEC2 = 2;
const VEC3 = 3;
