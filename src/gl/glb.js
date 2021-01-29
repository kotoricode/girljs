// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md
const toUint = (bytes) => bytes.reduce((a, b, i) => a + (b << i*8)) >>> 0;

const decoder = new TextDecoder();

const test = (bin, view, arr, range, sizeOf) =>
{
    for (let i = view.byteOffset, j = 0;
        i < (view.byteLength + view.byteOffset);
        i += (range.length * sizeOf))
    {
        arr[j++] = range.map(
            k => toUint(bin.subarray(
                i + k * sizeOf,
                i + (k+1) * sizeOf
            ))
        );
    }
};

class Test
{
    constructor(bin, view, range, sizeOf)
    {
        this.data = new Array(view.byteLength / (sizeOf * range.length));
        this.range = range;

        for (let i = view.byteOffset, j = 0;
            i < (view.byteLength + view.byteOffset);
            i += (range.length * sizeOf))
        {
            this.data[j++] = range.map(
                k => toUint(bin.subarray(
                    i + k * sizeOf,
                    i + (k+1) * sizeOf
                ))
            );
        }
    }
}

export const Glb = {
    async parse(blob)
    {
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

        // skip 4 bytes magic, 4 bytes version, 4 bytes length
        const jsonLengthBytes = data.subarray(12, 16);
        const jsonLength = toUint(jsonLengthBytes);
        const jsonStart = 20; // skip 4 bytes JSON header
        const jsonEnd = jsonStart + jsonLength;

        const jsonBytes = data.subarray(jsonStart, jsonEnd);
        const jsonString = decoder.decode(jsonBytes);
        const meta = JSON.parse(jsonString);

        const binLengthBytes = data.subarray(jsonEnd, jsonEnd + 4);
        const binLength = toUint(binLengthBytes);
        const binStart = jsonEnd + 8; // skip 4 bytes BIN\0 header
        const binEnd = binStart + binLength;

        const bin = data.subarray(binStart, binEnd);

        const [viewMesh, viewUv, viewIdx] = meta.bufferViews;

        const USHORT_BYTES = 2;
        const FLOAT32_BYTES = 4;
        const RANGE_3 = [0, 1, 2];
        const RANGE_2 = [0, 1];
        const VEC3 = 3;

        const objXyz = new Test(bin, viewMesh, RANGE_3, FLOAT32_BYTES);
        const objUv = new Test(bin, viewUv, RANGE_2, FLOAT32_BYTES);
        const objIdx = new Test(bin, viewIdx, RANGE_3, USHORT_BYTES);

        for (const obj of [objXyz, objUv])
        {
            let byteOffset = 0;
            obj.f32 = new Float32Array(objIdx.data.length * (VEC3 * obj.range.length));
            const view = new DataView(obj.f32.buffer);

            for (const verticesIdx of objIdx.data)
            {
                for (const vertexIdx of verticesIdx)
                {
                    for (const coord of obj.data[vertexIdx])
                    {
                        view.setUint32(byteOffset, coord, true);
                        byteOffset += Float32Array.BYTES_PER_ELEMENT;
                    }
                }
            }
        }

        return {
            mesh: Array.from(objXyz.f32),
            uv: Array.from(objUv.f32)
        };
    }
};
