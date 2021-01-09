import * as $ from "../const";
import { gl } from "../dom";

export const bindBuffer = (bufferId) =>
{
    if (!buffers.has(bufferId))
    {
        throw bufferId;
    }

    const buffer = buffers.get(bufferId);
    gl.bindBuffer($.ARRAY_BUFFER, buffer);
};

export const setBufferData = (bufferId, data) =>
{
    bindBuffer(bufferId);
    gl.bufferData($.ARRAY_BUFFER, new Float32Array(data), $.STATIC_DRAW);
    unbindBuffer();
};

export const unbindBuffer = () =>
{
    gl.bindBuffer($.ARRAY_BUFFER, null);
};

const buffers = new Map([
    [ $.BUFFER_MODEL, gl.createBuffer() ],
    [ $.BUFFER_DEBUG, gl.createBuffer() ]
]);
