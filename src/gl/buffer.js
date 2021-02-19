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
        for (const { type, buffer } of buffers.values())
        {
            gl.bindBuffer(type, null);
            gl.deleteBuffer(buffer);
        }

        buffers.clear();
        uBufferBindings.clear();

        /*----------------------------------------------------------------------
            Create buffers
        ----------------------------------------------------------------------*/
        buffers.set(
            $.BUF_ARR_TEXTURED,
            new BufferData($.ARRAY_BUFFER, $.STATIC_DRAW)
        );

        buffers.set(
            $.BUF_ARR_DYNAMIC,
            new BufferData($.ARRAY_BUFFER, $.DYNAMIC_DRAW)
        );

        buffers.set(
            $.BUF_ELEM_ARR_IDX,
            new BufferData($.ELEMENT_ARRAY_BUFFER, $.STATIC_DRAW)
        );

        buffers.set(
            $.BUF_ELEM_ARR_IDX_DYNAMIC,
            new BufferData($.ELEMENT_ARRAY_BUFFER, $.DYNAMIC_DRAW)
        );

        buffers.set(
            $.BUF_UNI_CAMERA,
            new BufferData($.UNIFORM_BUFFER, $.DYNAMIC_DRAW)
        );

        /*----------------------------------------------------------------------
            Assign sequential binding points for uniform buffers
        ----------------------------------------------------------------------*/
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
    setData(bufferId, data)
    {
        const { type, usage } = buffers.get(bufferId);
        gl.bufferData(type, data, usage);
    },
    setDataBind(bufferId, data)
    {
        const { buffer, type, usage } = buffers.get(bufferId);
        gl.bindBuffer(type, buffer);
        gl.bufferData(type, data, usage);
        gl.bindBuffer(type, null);
    },
    setUniformBlockBinding(program, blockId)
    {
        const bufferId = blockBuffers.get(blockId);
        const binding = uBufferBindings.get(bufferId);
        const blockIdx = gl.getUniformBlockIndex(program, blockId);
        gl.uniformBlockBinding(program, blockIdx, binding);
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
