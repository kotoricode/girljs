import * as $ from "../const";
import { gl } from "../dom";
import { SafeMap } from "../utils/better-builtins";

const Buffer = {
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
    data(bufferType, bufferId, data, usage)
    {
        Buffer.bind(bufferType, bufferId);
        gl.bufferData(bufferType, data, usage);
        Buffer.unbind(bufferType);
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
    getSize(bufferId)
    {
        return arrayBufferSizes.get(bufferId);
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

export const BufferUniform = {
    getBuffer(bufferId)
    {
        return Buffer.getBuffer($.UNIFORM_BUFFER, bufferId);
    },
    data(bufferId, data)
    {
        Buffer.data($.UNIFORM_BUFFER, bufferId, data, $.DYNAMIC_DRAW);
    },
    prepareBlock(program, blockId)
    {
        const bufferId = blockBuffers.get(blockId);
        const bindingPoint = bindingPoints.get(bufferId);
        const blockIdx = gl.getUniformBlockIndex(program, blockId);
        gl.uniformBlockBinding(program, blockIdx, bindingPoint);
    }
};

const reduceFunc = (array, bufferId) => (array.push(
    [bufferId, gl.createBuffer()]
), array);

const buffers = new SafeMap([
    [$.ARRAY_BUFFER, new SafeMap(
        [
            $.BUF_ARR_SPRITE,
            $.BUF_ARR_POLYGON,
            $.BUF_ARR_DEBUG
        ].reduce(reduceFunc, [])
    )],
    [$.UNIFORM_BUFFER, new SafeMap(
        [
            $.BUF_UNI_CAMERA
        ].reduce(reduceFunc, [])
    )]
]);

const arrayBufferSizes = new SafeMap();

const blockBuffers = new SafeMap([[$.UB_CAMERA, $.BUF_UNI_CAMERA]]);

const bindingPoints = new SafeMap([$.BUF_UNI_CAMERA].map((x, i) => [x, i]));

for (const [bufferId, idx] of bindingPoints)
{
    const buffer = BufferUniform.getBuffer(bufferId);
    gl.bindBufferBase($.UNIFORM_BUFFER, idx, buffer);
}
