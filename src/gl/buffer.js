import * as $ from "../const";
import { gl } from "../dom";

export const Buffer = {
    bindAsArray(bufferId)
    {
        Buffer.bind($.ARRAY_BUFFER, bufferId);
    },
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
        if (!buffers.has(bufferType))
        {
            throw bufferType;
        }

        const typeBuffers = buffers.get(bufferType);

        if (typeBuffers.has(bufferId))
        {
            return typeBuffers.get(bufferId);
        }

        throw bufferId;
    },
    getAsUniform(bufferId)
    {
        return Buffer.get($.UNIFORM_BUFFER, bufferId);
    },
    getSize(bufferId)
    {
        if (arrayBufferSizes.has(bufferId))
        {
            return arrayBufferSizes.get(bufferId);
        }

        throw bufferId;
    },
    set(bufferType, bufferId, data, usage)
    {
        Buffer.bind(bufferType, bufferId);
        Buffer.data(bufferType, data, usage);
        Buffer.unbind(bufferType);
    },
    setAsArray(bufferId, data, usage)
    {
        Buffer.set($.ARRAY_BUFFER, bufferId, data, usage);
        arrayBufferSizes.set(bufferId, data.length);
    },
    setAsUniform(bufferId, data)
    {
        Buffer.set($.UNIFORM_BUFFER, bufferId, data, $.DYNAMIC_DRAW);
    },
    unbind(bufferType)
    {
        gl.bindBuffer(bufferType, null);
    },
    unbindAsArray()
    {
        Buffer.unbind($.ARRAY_BUFFER);
    }
};

const reduceFunc = (array, bufferId) => (
    array.push([bufferId, gl.createBuffer()]),
    array
);

const buffers = new Map([
    [$.ARRAY_BUFFER, new Map(
        [
            $.BUF_ARR_SPRITE,
            $.BUF_ARR_POLYGON,
            $.BUF_ARR_DEBUG
        ].reduce(reduceFunc, [])
    )],
    [$.UNIFORM_BUFFER, new Map(
        [
            $.BUF_UNI_CAMERA
        ].reduce(reduceFunc, [])
    )]
]);

const arrayBufferSizes = new Map();
export const bindingPoints = [$.BUF_UNI_CAMERA];

for (let i = 0; i < bindingPoints.length; i++)
{
    const bufferId = bindingPoints[i];
    const buffer = Buffer.getAsUniform(bufferId);
    gl.bindBufferBase($.UNIFORM_BUFFER, i, buffer);
}

export const blockBuffers = new Map([
    [$.UB_CAMERA, $.BUF_UNI_CAMERA]
]);
