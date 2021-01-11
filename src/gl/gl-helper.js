import * as $ from "../const";
import { gl } from "../dom";
import { bindVao, unbindVao } from "./vao";

export const bindArrayBuffer = (bufferId) =>
{
    const buffer = getArrayBuffer(bufferId);
    gl.bindBuffer($.ARRAY_BUFFER, buffer);
};

export const depthMask = (state) =>
{
    gl.depthMask(state);
};

export const disable = (cap) =>
{
    gl.disable(cap);
};

export const drawArrays = (mode, offset, length) =>
{
    gl.drawArrays(mode, offset, length);
};

export const drawArraysVao = (mode, offset, length, vao) =>
{
    bindVao(vao);
    drawArrays(mode, offset, length);
    unbindVao();
};

export const enable = (cap) =>
{
    gl.enable(cap);
};

const getArrayBuffer = (bufferId) =>
{
    if (arrayBuffers.has(bufferId))
    {
        return arrayBuffers.get(bufferId);
    }

    throw bufferId;
};

export const getBufferSize = (bufferId) =>
{
    if (bufferSizes.has(bufferId))
    {
        return bufferSizes.get(bufferId);
    }

    throw bufferId;
};

const getUniformBuffer = (bufferId) =>
{
    if (uniformBuffers.has(bufferId))
    {
        return uniformBuffers.get(bufferId);
    }

    throw bufferId;
};

export const setArrayBufferData = (bufferId, data, usage) =>
{
    bindArrayBuffer(bufferId);
    gl.bufferData($.ARRAY_BUFFER, new Float32Array(data), usage);
    unbindArrayBuffer();

    bufferSizes.set(bufferId, data.length);
};

export const setUniformBufferData = (bufferId, data) =>
{
    const buffer = getUniformBuffer(bufferId);
    gl.bindBuffer($.UNIFORM_BUFFER, buffer);
    gl.bufferData($.UNIFORM_BUFFER, data, $.DYNAMIC_DRAW);
    gl.bindBuffer($.UNIFORM_BUFFER, null);
};

export const unbindArrayBuffer = () =>
{
    gl.bindBuffer($.ARRAY_BUFFER, null);
};

export const useProgramBindBlocks = (programData) =>
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

const reduceFunc = (array, bufferId) => (
    array.push([bufferId, gl.createBuffer()]),
    array
);

const arrayBuffers = new Map([
    $.ARRAY_BUFFER_SPRITE,
    $.ARRAY_BUFFER_POLYGON,
    $.ARRAY_BUFFER_DEBUG
].reduce(reduceFunc, []));

const uniformBuffers = new Map([
    $.UNIFORM_BUFFER_CAMERA
].reduce(reduceFunc, []));

let oldProgram;
const bufferSizes = new Map();
const bindingPoints = [$.UNIFORM_BUFFER_CAMERA];

for (let i = 0; i < bindingPoints.length; i++)
{
    const bufferId = bindingPoints[i];
    const buffer = getUniformBuffer(bufferId);
    gl.bindBufferBase($.UNIFORM_BUFFER, i, buffer);
}

const blockBuffers = new Map([
    [$.UNIFORM_BLOCK_CAMERA, $.UNIFORM_BUFFER_CAMERA]
]);
