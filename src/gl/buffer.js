import * as $ from "../const";
import { gl } from "../main";
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
        /*----------------------------------------------------------------------
            Create buffers
        ----------------------------------------------------------------------*/
        buffers.clear();

        const def = [
            $.BUF_ARR_TEXTURED,     $.ARRAY_BUFFER,         $.STATIC_DRAW,
            $.BUF_ARR_DYNAMIC,      $.ARRAY_BUFFER,         $.DYNAMIC_DRAW,
            $.BUF_ELEM_INDEX,         $.ELEMENT_ARRAY_BUFFER, $.STATIC_DRAW,
            $.BUF_ELEM_INDEX_DYNAMIC, $.ELEMENT_ARRAY_BUFFER, $.DYNAMIC_DRAW,
            $.BUF_UNI_CAMERA,       $.UNIFORM_BUFFER,       $.DYNAMIC_DRAW
        ];

        for (let i = 0; i < def.length;)
        {
            const bufferId = def[i++];
            const bufferType = def[i++];
            const bufferUsage = def[i++];

            buffers.set(bufferId, new BufferData(bufferType, bufferUsage));
        }

        /*----------------------------------------------------------------------
            Assign sequential binding points for uniform buffers
        ----------------------------------------------------------------------*/
        uBufferBindings.clear();

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
        const index = gl.getUniformBlockIndex(program, blockId);
        gl.uniformBlockBinding(program, index, binding);
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
