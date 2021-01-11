import * as $ from "../const";
import { gl } from "../dom";

export const bindArrayBuffer = (bufferId) => bindBuffer(
    $.ARRAY_BUFFER, bufferId
);

const bindBuffer = (bufferType, bufferId) =>
{
    const buffer = getBuffer(bufferType, bufferId);
    gl.bindBuffer(bufferType, buffer);
};

const bufferData = (bufferType, data, usage) => gl.bufferData(
    bufferType, data, usage
);

export const getArrayBufferSize = (bufferId) =>
{
    if (arrayBufferSizes.has(bufferId))
    {
        return arrayBufferSizes.get(bufferId);
    }

    throw bufferId;
};

const getBuffer = (bufferType, bufferId) =>
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
};

const getUniformBuffer = (bufferId) => getBuffer($.UNIFORM_BUFFER, bufferId);

export const setArrayBuffer = (bufferId, data, usage) =>
{
    setBuffer($.ARRAY_BUFFER, bufferId, data, usage);
    arrayBufferSizes.set(bufferId, data.length);
};

const setBuffer = (bufferType, bufferId, data, usage) =>
{
    bindBuffer(bufferType, bufferId);
    bufferData(bufferType, data, usage);
    unbindBuffer(bufferType);
};

export const setUniformBuffer = (bufferId, data) => setBuffer(
    $.UNIFORM_BUFFER, bufferId, data, $.DYNAMIC_DRAW
);

export const unbindArrayBuffer = () => unbindBuffer($.ARRAY_BUFFER);

const unbindBuffer = (bufferType) => gl.bindBuffer(bufferType, null);

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
    const buffer = getUniformBuffer(bufferId);
    gl.bindBufferBase($.UNIFORM_BUFFER, i, buffer);
}

export const blockBuffers = new Map([
    [$.UB_CAMERA, $.BUF_UNI_CAMERA]
]);
