import * as $ from "../const";
import { gl } from "../dom";

const buffers = new Map([
    [ $.BUFFER_MODEL, gl.createBuffer() ],
    [ $.BUFFER_DEBUG, gl.createBuffer() ]
]);

export const bindBuffer = (bufferId) =>
{
    if (!buffers.has(bufferId))
    {
        throw bufferId;
    }

    const buffer = buffers.get(bufferId);
    gl.bindBuffer($.ARRAY_BUFFER, buffer);
};

export const unbindBuffer = () =>
{
    gl.bindBuffer($.ARRAY_BUFFER, null);
};
