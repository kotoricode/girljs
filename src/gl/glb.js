// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md

const toUint = (bytes) => bytes.reduce((a, b, i) => a + (b << i*8)) >>> 0;

const decoder = new TextDecoder();

const RANGE_2 = [0, 1];
const RANGE_3 = [0, 1, 2];
const USHORT_BYTES = Uint16Array.BYTES_PER_ELEMENT;
const FLOAT32_BYTES = Float32Array.BYTES_PER_ELEMENT;
const VEC3 = 3;

class GlbData
{
    constructor(bin, view, range, sizeOf)
    {
        const { byteLength, byteOffset } = view;

        this.rangeLen = range.length;
        const increment = this.rangeLen * sizeOf;
        this.data = new Array(byteLength / increment);

        for (let i = 0; i < this.data.length; i++)
        {
            const offset = byteOffset + i * increment;

            this.data[i] = range.map(j => toUint(
                bin.subarray(
                    offset + j * sizeOf,
                    offset + (j+1) * sizeOf
                )
            ));
        }
    }
}

export const Glb = {
    async parse(blob)
    {
        /*----------------------------------------------------------------------
            Read glb
        ----------------------------------------------------------------------*/
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

        /*----------------------------------------------------------------------
            Get JSON
        ----------------------------------------------------------------------*/
        const jsonLenBytes = data.subarray(12, 16); // skip header 12 bytes
        const jsonLen = toUint(jsonLenBytes);

        const jsonStart = 20; // skip header 4 bytes
        const jsonEnd = jsonStart + jsonLen;
        const json = data.subarray(jsonStart, jsonEnd);

        const jsonString = decoder.decode(json);
        const meta = JSON.parse(jsonString);

        /*----------------------------------------------------------------------
            Get binary
        ----------------------------------------------------------------------*/
        const binLenBytes = data.subarray(jsonEnd, jsonEnd + 4);
        const binLen = toUint(binLenBytes);

        const binStart = jsonEnd + 8; // skip header 4 bytes
        const binEnd = binStart + binLen;
        const bin = data.subarray(binStart, binEnd);

        /*----------------------------------------------------------------------
            Process binary
        ----------------------------------------------------------------------*/
        const [viewMesh, viewUv, viewIdx] = meta.bufferViews;

        const mesh = new GlbData(bin, viewMesh, RANGE_3, FLOAT32_BYTES);
        const uv = new GlbData(bin, viewUv, RANGE_2, FLOAT32_BYTES);
        const idx = new GlbData(bin, viewIdx, RANGE_3, USHORT_BYTES);

        for (const obj of [mesh, uv])
        {
            let byteOffset = 0;
            const f32 = new Float32Array(idx.data.length * VEC3 * obj.rangeLen);
            const view = new DataView(f32.buffer);

            for (const verticesIdx of idx.data)
            {
                for (const vertexIdx of verticesIdx)
                {
                    for (const coord of obj.data[vertexIdx])
                    {
                        view.setUint32(byteOffset, coord, true);
                        byteOffset += FLOAT32_BYTES;
                    }
                }
            }

            obj.array = Array.from(f32);
        }

        return {
            mesh: mesh.array,
            uv: uv.array
        };
    }
};
