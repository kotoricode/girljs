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

    const readFloat32 = (binOffset) => dataView.getFloat32(binOffset, true);
    const readUint16 = (binOffset) => dataView.getUint16(binOffset, true);

    return {
        mesh: readBin(readFloat32, viewMesh, binStart, SIZEOF_FLOAT32),
        uv: readBin(readFloat32, viewUv, binStart, SIZEOF_FLOAT32),
        idx: readBin(readUint16, viewIdx, binStart, SIZEOF_UINT16)
    };
};

const readBin = (func, view, binStart, sizeOf) =>
{
    const array = new Array(view.byteLength / sizeOf);
    const viewStart = binStart + view.byteOffset;

    for (let i = 0; i < array.length; i++)
    {
        array[i] = func(viewStart + i * sizeOf);
    }

    return array;
};
