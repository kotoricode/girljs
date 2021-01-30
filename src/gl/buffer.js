import * as $ from "../const";
import { gl } from "../dom";
import { SafeMap } from "../utility";

class BufferData
{
    constructor(type, usage)
    {
        this.buffer = gl.createBuffer();
        this.type = type;
        this.usage = usage;
    }
}

export const Buffer = {
    bind(bufferId)
    {
        const { type, buffer } = buffers.get(bufferId);
        gl.bindBuffer(type, buffer);
    },
    prepareBlock(program, blockId)
    {
        const bufferId = blockBuffers.get(blockId);
        const binding = uBufferBindings.get(bufferId);
        const blockIdx = gl.getUniformBlockIndex(program, blockId);
        gl.uniformBlockBinding(program, blockIdx, binding);
    },
    setData(bufferId, data)
    {
        const bufferData = buffers.get(bufferId);
        const { type, buffer, usage } = bufferData;

        gl.bindBuffer(type, buffer);
        gl.bufferData(type, data, usage);
        gl.bindBuffer(type, null);
    },
    unbind(bufferId)
    {
        const { type } = buffers.get(bufferId);
        gl.bindBuffer(type, null);
    }
};

const buffers = new SafeMap([
    [$.BUF_ARR_MODEL, new BufferData($.ARRAY_BUFFER, $.STATIC_DRAW)],
    [$.BUF_ARR_DEBUG, new BufferData($.ARRAY_BUFFER, $.STATIC_DRAW)],
    [$.BUF_UNI_CAMERA, new BufferData($.UNIFORM_BUFFER, $.DYNAMIC_DRAW)]
]);

const blockBuffers = new SafeMap([
    [$.UB_CAMERA, $.BUF_UNI_CAMERA]
]);

const uBufferBindings = new SafeMap();

for (const [bufferId, bufferData] of buffers)
{
    if (bufferData.type === $.UNIFORM_BUFFER)
    {
        const binding = uBufferBindings.size;
        gl.bindBufferBase($.UNIFORM_BUFFER, binding, bufferData.buffer);
        uBufferBindings.set(bufferId, binding);
    }
}
