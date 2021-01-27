// https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md

import { SafeMap } from "../utility";

const byteSizes = new SafeMap([
    ["5120", 1], // byte
    ["5121", 1], // ubyte
    ["5122", 2], // short
    ["5123", 2], // ushort
    ["5125", 4], // uint
    ["5126", 4], // float
]);

const compSizes = new SafeMap([
    ["SCALAR", 1],
    ["VEC2", 2],
    ["VEC3", 3],
    ["VEC4", 4],
    ["MAT2", 4],
    ["MAT3", 9],
    ["MAT4", 16],
]);

export class Gltf
{
    constructor(meshOffset, uvOffset)
    {
        this.meshOffset = meshOffset;
        this.uvOffset = uvOffset;
    }

    static async parse(blob)
    {
        const process = async(data) =>
        {
            if (data.done)
            {
                return true;
            }

            while (offset < data.value.length)
            {
                bytes[0] = data.value[offset++];
                bytes[1] = data.value[offset++];
                bytes[2] = data.value[offset++];
                bytes[3] = data.value[offset++];

                switch (state)
                {
                    case STATE_SEARCHING_JSON:
                        if (isJsonHeader(bytes))
                        {
                            state = STATE_READING_JSON;
                        }
                        break;
                    case STATE_READING_JSON:
                        if (isBinHeader(bytes))
                        {
                            state = STATE_READING_BIN;
                        }
                        else
                        {
                            jsonData.push(...bytes);
                        }
                        break;
                    case STATE_READING_BIN:
                        binData.push(...bytes);
                        break;
                    default:
                        throw Error;
                }
            }

            return data.done;
        };

        const bytes = [];
        const stream = blob.stream();
        const reader = stream.getReader();
        let isFullyRead = false;
        let offset = 0;

        let state = STATE_SEARCHING_JSON;

        const jsonData = [];
        const binData = [];

        while (!isFullyRead)
        {
            isFullyRead = await reader.read().then(process);
        }

        console.log(jsonData);
        console.log(binData);

        return "lol";
    }
}

const isJsonHeader = (bytes) => (
    bytes[0] === 74 &&
    bytes[1] === 83 &&
    bytes[2] === 79 &&
    bytes[3] === 78
);

const isBinHeader = (bytes) => (
    bytes[0] === 66 &&
    bytes[1] === 73 &&
    bytes[2] === 78 &&
    bytes[3] === 0
);

const STATE_SEARCHING_JSON = 0;
const STATE_READING_JSON = 1;
const STATE_READING_BIN = 2;
