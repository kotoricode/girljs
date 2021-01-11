import * as $ from "../const";
import { gl } from "../dom";
import { Vao } from "./vao";

/*------------------------------------------------------------------------------
    Helper functions
------------------------------------------------------------------------------*/
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

export const depthMask = (state) => gl.depthMask(state);

export const disable = (cap) => gl.disable(cap);

export const drawArrays = (mode, offset, length) => gl.drawArrays(
    mode, offset, length
);

export const drawArraysVao = (mode, offset, length, vao) =>
{
    Vao.bind(vao);
    drawArrays(mode, offset, length);
    Vao.unbind();
};

export const enable = (cap) => gl.enable(cap);

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

export const setProgram = (programData) =>
{
    const program = programData.program;

    if (program !== oldProgram)
    {
        gl.useProgram(program);
        oldProgram = program;
    }

    const blocks = programData.uniforms.blocks;

    if (blocks)
    {
        for (const block of blocks)
        {
            const bufferId = blockBuffers.get(block);
            const bindingPoint = bindingPoints.indexOf(bufferId);

            if (bindingPoint === -1)
            {
                throw bufferId;
            }

            const blockIdx = gl.getUniformBlockIndex(program, block);
            gl.uniformBlockBinding(program, blockIdx, bindingPoint);
        }
    }
};

export const setUniformBuffer = (bufferId, data) => setBuffer(
    $.UNIFORM_BUFFER, bufferId, data, $.DYNAMIC_DRAW
);

export const unbindArrayBuffer = () => unbindBuffer($.ARRAY_BUFFER);

const unbindBuffer = (bufferType) => gl.bindBuffer(bufferType, null);

/*------------------------------------------------------------------------------
    Setup
------------------------------------------------------------------------------*/
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

let oldProgram;
const arrayBufferSizes = new Map();
const bindingPoints = [$.BUF_UNI_CAMERA];

for (let i = 0; i < bindingPoints.length; i++)
{
    const bufferId = bindingPoints[i];
    const buffer = getUniformBuffer(bufferId);
    gl.bindBufferBase($.UNIFORM_BUFFER, i, buffer);
}

const blockBuffers = new Map([
    [$.UB_CAMERA, $.BUF_UNI_CAMERA]
]);
