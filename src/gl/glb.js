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

    const mesh = new Array(viewMesh.byteLength / FLOAT32_BYTES);
    const uv = new Array(viewUv.byteLength / FLOAT32_BYTES);
    const idx = new Array(viewIdx.byteLength / UINT16_BYTES);

    const viewIdxStart = binStart + viewIdx.byteOffset;
    const viewMeshStart = binStart + viewMesh.byteOffset;
    const viewUvStart = binStart + viewUv.byteOffset;

    for (let i = 0; i < mesh.length; i++)
    {
        mesh[i] = dataView.getFloat32(viewMeshStart + i * FLOAT32_BYTES, true);
    }

    for (let i = 0; i < uv.length; i++)
    {
        uv[i] = dataView.getFloat32(viewUvStart + i * FLOAT32_BYTES, true);
    }

    for (let i = 0; i < idx.length; i++)
    {
        idx[i] = dataView.getUint16(viewIdxStart + i * UINT16_BYTES, true);
    }

    return { mesh, uv, idx };
};

const UINT16_BYTES = 2;
const FLOAT32_BYTES = 4;
