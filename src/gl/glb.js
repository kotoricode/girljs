// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md

import { SIZEOF_FLOAT32, SIZEOF_UINT16 } from "../utility";

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

    const isLittleEndian = true;

    const mesh = new Array(viewMesh.byteLength / SIZEOF_FLOAT32);
    const uv = new Array(viewUv.byteLength / SIZEOF_FLOAT32);
    const idx = new Array(viewIdx.byteLength / SIZEOF_UINT16);

    const viewMeshStart = binStart + viewMesh.byteOffset;
    const viewUvStart = binStart + viewUv.byteOffset;
    const viewIdxStart = binStart + viewIdx.byteOffset;

    for (let i = 0; i < mesh.length; i++)
    {
        mesh[i] = dataView.getFloat32(
            viewMeshStart + i * SIZEOF_FLOAT32,
            isLittleEndian
        );
    }

    for (let i = 0; i < uv.length; i++)
    {
        uv[i] = dataView.getFloat32(
            viewUvStart + i * SIZEOF_FLOAT32,
            isLittleEndian
        );
    }

    for (let i = 0; i < idx.length; i++)
    {
        idx[i] = dataView.getUint16(
            viewIdxStart + i * SIZEOF_UINT16,
            isLittleEndian
        );
    }

    return { mesh, uv, idx };
};
