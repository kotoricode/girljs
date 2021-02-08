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
        Object.freeze(this);
    }
}

export const Buffer = {
    bind(bufferId)
    {
        const { type, buffer } = buffers.get(bufferId);
        gl.bindBuffer(type, buffer);
    },
    init()
    {
        buffers.clear();
        uBufferBindings.clear();

        const data = [
            $.BUF_ARR_MODEL, new BufferData($.ARRAY_BUFFER, $.STATIC_DRAW),
            $.BUF_ARR_DEBUG, new BufferData($.ARRAY_BUFFER, $.DYNAMIC_DRAW),
            $.BUF_UNI_CAMERA, new BufferData($.UNIFORM_BUFFER, $.DYNAMIC_DRAW)
        ];

        let i = 0;

        while (i < data.length)
        {
            buffers.set(data[i++], data[i++]);
        }

        for (const [bufferId, bufferData] of buffers)
        {
            if (bufferData.type === $.UNIFORM_BUFFER)
            {
                const binding = uBufferBindings.size;
                gl.bindBufferBase($.UNIFORM_BUFFER, binding, bufferData.buffer);
                uBufferBindings.set(bufferId, binding);
            }
        }
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
        const { type, buffer, usage } = buffers.get(bufferId);

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

const buffers = new SafeMap();

const blockBuffers = new SafeMap([
    [$.UB_CAMERA, $.BUF_UNI_CAMERA]
]);

const uBufferBindings = new SafeMap();

Buffer.init();
