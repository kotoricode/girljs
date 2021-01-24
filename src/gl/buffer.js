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
        this.size = null;
    }
}

export const Buffer = {
    bind(bufferId)
    {
        const bufferData = buffers.get(bufferId);
        gl.bindBuffer(bufferData.type, bufferData.buffer);
    },
    getSize(bufferId)
    {
        return buffers.get(bufferId).size;
    },
    setData(bufferId, data)
    {
        const bufferData = buffers.get(bufferId);

        Buffer.bind(bufferId);
        gl.bufferData(bufferData.type, data, bufferData.usage);
        Buffer.unbind(bufferId);

        bufferData.size = data.length;
    },
    prepareBlock(program, blockId)
    {
        const bufferId = blockBuffers.get(blockId);
        const bindingPoint = uniformBufferBindingPoint.get(bufferId);
        const blockIdx = gl.getUniformBlockIndex(program, blockId);
        gl.uniformBlockBinding(program, blockIdx, bindingPoint);
    },
    unbind(bufferId)
    {
        const bufferData = buffers.get(bufferId);
        gl.bindBuffer(bufferData.type, null);
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

const uniformBufferBindingPoint = new SafeMap();

for (const [bufferId, bufferData] of buffers)
{
    if (bufferData.type === $.UNIFORM_BUFFER)
    {
        const bindingPoint = uniformBufferBindingPoint.size;
        gl.bindBufferBase($.UNIFORM_BUFFER, bindingPoint, bufferData.buffer);
        uniformBufferBindingPoint.set(bufferId, bindingPoint);
    }
}
