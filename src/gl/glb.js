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

const RANGE_2 = [0, 1];
const RANGE_3 = [0, 1, 2];
const USHORT_BYTES = Uint16Array.BYTES_PER_ELEMENT;
const FLOAT32_BYTES = Float32Array.BYTES_PER_ELEMENT;
const VEC3 = 3;

class Glb
{
    constructor(bin, view, range, sizeOf)
    {
        const { byteLength, byteOffset } = view;

        this.rangeLen = range.length;
        const increment = this.rangeLen * sizeOf;
        this.data = new Array(byteLength / increment);
        const uint = sizeOf === FLOAT32_BYTES ? toUint32 : toUint16;

        if (range === RANGE_3)
        {
            for (let i = 0; i < this.data.length; i++)
            {
                const offset = byteOffset + i * increment;

                this.data[i] = [
                    uint(bin, offset),
                    uint(bin, offset+sizeOf),
                    uint(bin, offset+sizeOf*2)
                ];
            }
        }
        else
        {
            for (let i = 0; i < this.data.length; i++)
            {
                const offset = byteOffset + i * increment;

                this.data[i] = [
                    uint(bin, offset),
                    uint(bin, offset+sizeOf),
                ];
            }
        }

        Object.freeze(this);
    }
}

const toUnindexedArray = (obj, idx) =>
{
    let byteOffset = 0;
    const f32 = new Float32Array(idx.data.length * VEC3 * obj.rangeLen);
    const view = new DataView(f32.buffer);

    for (const triangle of idx.data)
    {
        for (const vertexIdx of triangle)
        {
            for (const coord of obj.data[vertexIdx])
            {
                view.setUint32(byteOffset, coord, true);
                byteOffset += FLOAT32_BYTES;
            }
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
        Get binary
    --------------------------------------------------------------------------*/
    const binLen = toUint32(data, jsonEnd);

    const binStart = jsonEnd + 8; // skip header 4 bytes
    const binEnd = binStart + binLen;
    const bin = data.subarray(binStart, binEnd);

    /*--------------------------------------------------------------------------
        Process binary
    --------------------------------------------------------------------------*/
    const [viewMesh, viewUv, viewIdx] = meta.bufferViews;

    const mesh = new Glb(bin, viewMesh, RANGE_3, FLOAT32_BYTES);
    const uv = new Glb(bin, viewUv, RANGE_2, FLOAT32_BYTES);
    const idx = new Glb(bin, viewIdx, RANGE_3, USHORT_BYTES);

    console.log(window.performance.now() - t1);

    return {
        mesh: toUnindexedArray(mesh, idx),
        uv: toUnindexedArray(uv, idx)
    };
};
