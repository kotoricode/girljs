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

const decoder = new TextDecoder();

const USHORT_BYTES = Uint16Array.BYTES_PER_ELEMENT;
const FLOAT32_BYTES = Float32Array.BYTES_PER_ELEMENT;

class Glb
{
    constructor(data, binOffset, view, range, sizeOf)
    {
        const viewOffset = binOffset + view.byteOffset;

        this.range = range;
        this.data = new Array(view.byteLength / sizeOf);
        const uint = sizeOf === FLOAT32_BYTES ? toUint32 : toUint16;

        for (let i = 0; i < this.data.length; i++)
        {
            this.data[i] = uint(data, viewOffset + i * sizeOf);
        }

        Object.freeze(this);
    }
}

const toUnindexedArray = (obj, idx) =>
{
    let byteOffset = 0;
    const f32 = new Float32Array(idx.data.length * idx.range * obj.range);
    const view = new DataView(f32.buffer);

    for (const i of idx.data)
    {
        const triStart = i * obj.range;

        for (let j = 0; j < obj.range; j++)
        {
            view.setUint32(byteOffset, obj.data[triStart+j], true);
            byteOffset += FLOAT32_BYTES;
        }
    }

    return Array.from(f32);
};

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

    const mesh = new Glb(data, binStart, viewMesh, 3, FLOAT32_BYTES);
    const uv = new Glb(data, binStart, viewUv, 2, FLOAT32_BYTES);
    const idx = new Glb(data, binStart, viewIdx, 3, USHORT_BYTES);

    console.log(window.performance.now() - t1);

    return {
        mesh: toUnindexedArray(mesh, idx),
        uv: toUnindexedArray(uv, idx)
    };
};
