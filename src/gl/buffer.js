import * as $ from "../const";
import { gl } from "../dom";
import { SafeMap } from "../utility";

export const Buffer = {
    bind(bufferType, bufferId)
    {
        const buffer = Buffer.getBuffer(bufferType, bufferId);
        gl.bindBuffer(bufferType, buffer);
    },
    getBuffer(bufferType, bufferId)
    {
        const typeBuffers = buffers.get(bufferType);

        return typeBuffers.get(bufferId);
    },
    getSize(bufferId)
    {
        return arrayBufferSizes.get(bufferId);
    },
    data(bufferType, bufferId, data, usage)
    {
        Buffer.bind(bufferType, bufferId);
        gl.bufferData(bufferType, data, usage);
        Buffer.unbind(bufferType);
    },
    prepareBlock(program, blockId)
    {
        const bufferId = blockBuffers.get(blockId);
        const bindingPoint = uniformBuffers.indexOf(bufferId);

        if (bindingPoint === -1) throw Error;

        const blockIdx = gl.getUniformBlockIndex(program, blockId);
        gl.uniformBlockBinding(program, blockIdx, bindingPoint);
    },
    unbind(bufferType)
    {
        gl.bindBuffer(bufferType, null);
    }
};

export const BufferArray = {
    bind(bufferId)
    {
        Buffer.bind($.ARRAY_BUFFER, bufferId);
    },
    data(bufferId, data, usage)
    {
        Buffer.data($.ARRAY_BUFFER, bufferId, data, usage);
        arrayBufferSizes.set(bufferId, data.length);
    },
    unbind()
    {
        Buffer.unbind($.ARRAY_BUFFER);
    }
};

const bufferCreator = (array, bufferId) =>
{
    array.push([bufferId, gl.createBuffer()]);

    return array;
};

const buffers = new SafeMap([
    [$.ARRAY_BUFFER, new SafeMap(
        [
            $.BUF_ARR_MODEL,
            $.BUF_ARR_DEBUG
        ].reduce(bufferCreator, [])
    )],
    [$.UNIFORM_BUFFER, new SafeMap(
        [
            $.BUF_UNI_CAMERA
        ].reduce(bufferCreator, [])
    )]
]);

const arrayBufferSizes = new SafeMap();

const blockBuffers = new SafeMap([
    [$.UB_CAMERA, $.BUF_UNI_CAMERA]
]);

const uniformBuffers = [$.BUF_UNI_CAMERA];

for (let i = 0; i < uniformBuffers.length; i++)
{
    const bufferId = uniformBuffers[i];
    const buffer = Buffer.getBuffer($.UNIFORM_BUFFER, bufferId);
    gl.bindBufferBase($.UNIFORM_BUFFER, i, buffer);
}
