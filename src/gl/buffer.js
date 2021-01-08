import * as $ from "../const";
import { gl } from "../dom";

const buffers = new Map([
    [ $.BUFFER_MODEL, gl.createBuffer() ],
    [ $.BUFFER_DEBUG, gl.createBuffer() ]
]);

export const getBuffer = (bufferId) =>
{
    if (buffers.has(bufferId))
    {
        return buffers.get(bufferId);
    }

    throw bufferId;
};
