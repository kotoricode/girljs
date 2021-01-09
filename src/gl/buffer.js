import * as $ from "../const";
import { gl } from "../dom";

export const bindBuffer = (bufferId) =>
{
    if (activeBuffer)
    {
        throw Error(`${bufferId}, ${activeBuffer}`);
    }

    if (!buffers.has(bufferId))
    {
        throw bufferId;
    }

    activeBuffer = bufferId;
    const buffer = buffers.get(bufferId);
    gl.bindBuffer($.ARRAY_BUFFER, buffer);
};

export const getBufferSize = (bufferId) =>
{
    if (bufferSizes.has(bufferId))
    {
        return bufferSizes.get(bufferId);
    }

    throw bufferId;
};

export const setBufferData = (bufferId, data, usage) =>
{
    bindBuffer(bufferId);
    gl.bufferData($.ARRAY_BUFFER, new Float32Array(data), usage);
    unbindBuffer();

    bufferSizes.set(bufferId, data.length);
};

export const unbindBuffer = () =>
{
    activeBuffer = null;
    gl.bindBuffer($.ARRAY_BUFFER, null);
};

const buffers = new Map([
    [ $.BUFFER_MODEL, gl.createBuffer() ],
    [ $.BUFFER_DEBUG, gl.createBuffer() ]
]);

const bufferSizes = new Map();

let activeBuffer;
