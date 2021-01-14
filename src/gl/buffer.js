import * as $ from "../const";
import { gl } from "../dom";
import { SafeMap } from "../utils/better-builtins";

const Buffer = {
    bind(bufferType, bufferId)
    {
        const buffer = Buffer.get(bufferType, bufferId);
        gl.bindBuffer(bufferType, buffer);
    },
    data(bufferType, data, usage)
    {
        gl.bufferData(bufferType, data, usage);
    },
    get(bufferType, bufferId)
    {
        const typeBuffers = buffers.get(bufferType);

        return typeBuffers.get(bufferId);
    },
    set(bufferType, bufferId, data, usage)
    {
        Buffer.bind(bufferType, bufferId);
        Buffer.data(bufferType, data, usage);
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
    set(bufferId, data, usage)
    {
        Buffer.set($.ARRAY_BUFFER, bufferId, data, usage);
        arrayBufferSizes.set(bufferId, data.length);
    },
    unbind()
    {
        Buffer.unbind($.ARRAY_BUFFER);
    },
};

export const BufferUniform = {
    get(bufferId)
    {
        return Buffer.get($.UNIFORM_BUFFER, bufferId);
    },
    getBindingPoint(bufferId)
    {
        const bindingPoint = bindingPoints.indexOf(bufferId);

        if (bindingPoint >= 0)
        {
            return bindingPoint;
        }

        throw bufferId;
    },
    getBufferByBlock(blockId)
    {
        return blockBuffers.get(blockId);
    },
    set(bufferId, data)
    {
        Buffer.set($.UNIFORM_BUFFER, bufferId, data, $.DYNAMIC_DRAW);
    },
};

const reduceFunc = (array, bufferId) => (
    array.push([bufferId, gl.createBuffer()]),
    array
);

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
const bindingPoints = [$.BUF_UNI_CAMERA];

for (let i = 0; i < bindingPoints.length; i++)
{
    const bufferId = bindingPoints[i];
    const buffer = BufferUniform.get(bufferId);
    gl.bindBufferBase($.UNIFORM_BUFFER, i, buffer);
}

const blockBuffers = new SafeMap([
    [$.UB_CAMERA, $.BUF_UNI_CAMERA]
]);
