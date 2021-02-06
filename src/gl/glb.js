// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md

// These seem to be a good 20% faster than Array.reduce
const toUint16 = (bytes) => bytes[1] * 256 + bytes[0];

const toUint32 = (bytes) => (
    bytes[3] * 16777216 +
    bytes[2] * 65536 +
    toUint16(bytes)
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

        const toUint = (sizeOf === 4) ? toUint32 : toUint16;

        for (let i = 0; i < this.data.length; i++)
        {
            const offset = byteOffset + i * increment;

            // easiest way to turn raw 4 bytes into float is to read them
            // as uint32 here, then write to float32array using setUint32
            this.data[i] = range.map(j => toUint(
                bin.subarray(
                    offset + j * sizeOf,
                    offset + (j+1) * sizeOf
                )
            ));
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
    const jsonLenBytes = data.subarray(12, 16); // skip header 12 bytes
    const jsonLen = toUint32(jsonLenBytes);

    const jsonStart = 20; // skip header 4 bytes
    const jsonEnd = jsonStart + jsonLen;
    const json = data.subarray(jsonStart, jsonEnd);

    const jsonString = decoder.decode(json);
    const meta = JSON.parse(jsonString);

    /*--------------------------------------------------------------------------
        Get binary
    --------------------------------------------------------------------------*/
    const binLenBytes = data.subarray(jsonEnd, jsonEnd + 4);
    const binLen = toUint32(binLenBytes);

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
