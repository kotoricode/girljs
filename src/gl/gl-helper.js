import * as $ from "../const";
import { gl } from "../dom";

export const bindUniformBlock = (program, bufferId, blockName) =>
{
    const bindingPoint = bindingPoints.indexOf(bufferId);

    if (bindingPoint === -1)
    {
        throw bufferId;
    }

    const blockIdx = gl.getUniformBlockIndex(program, blockName);
    gl.uniformBlockBinding(program, blockIdx, bindingPoint);
};

export const bindArrayBuffer = (bufferId) =>
{
    const buffer = getBuffer(bufferId);
    gl.bindBuffer($.ARRAY_BUFFER, buffer);
};

export const bindTexture = (texture) =>
{
    if (texture !== oldTexture)
    {
        gl.bindTexture($.TEXTURE_2D, texture);
        oldTexture = texture;
    }
};

export const bindUniformBuffer = (bufferId) =>
{
    const buffer = getBuffer(bufferId);
    gl.bindBuffer($.UNIFORM_BUFFER, buffer);
};

export const bindVao = (vao) =>
{
    gl.bindVertexArray(vao);
};

export const createTexture = () => gl.createTexture();

export const createVao = (programData) =>
{
    const vao = gl.createVertexArray();
    vaos.set(programData, vao);

    return vao;
};

export const deleteVao = (programData) =>
{
    if (!vaos.has(programData))
    {
        throw programData;
    }

    const vao = vaos.get(programData);
    vaos.delete(programData);
    gl.deleteVertexArray(vao);
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

export const getBuffer = (bufferId) =>
{
    if (buffers.has(bufferId))
    {
        return buffers.get(bufferId);
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

export const setArrayBufferData = (bufferId, data) =>
{
    bindArrayBuffer(bufferId);
    gl.bufferData($.ARRAY_BUFFER, new Float32Array(data), $.STATIC_DRAW);
    unbindArrayBuffer();

    bufferSizes.set(bufferId, data.length);
};

export const setUniformBufferData = (bufferId, data) =>
{
    bindUniformBuffer(bufferId);
    gl.bufferData($.UNIFORM_BUFFER, data, $.DYNAMIC_DRAW);
    unbindUniformBuffer();
};

export const setTextureParami = (key, value) =>
{
    gl.texParameteri($.TEXTURE_2D, key, value);
};

export const unbindTexture = () =>
{
    bindTexture(null);
};

export const unbindVao = () =>
{
    bindVao(null);
};

export const unbindArrayBuffer = () =>
{
    gl.bindBuffer($.ARRAY_BUFFER, null);
};

export const unbindUniformBuffer = () =>
{
    gl.bindBuffer($.UNIFORM_BUFFER, null);
};

export const useProgram = (program) =>
{
    if (program !== oldProgram)
    {
        gl.useProgram(program);
        oldProgram = program;
    }
};

const buffers = new Map(
    [
        $.ARRAY_BUFFER_SPRITE,
        $.ARRAY_BUFFER_POLYGON,
        $.ARRAY_BUFFER_DEBUG,
        $.UNIFORM_BUFFER_CAMERA
    ].reduce((array, bufferId) => (
        array.push([bufferId, gl.createBuffer()]),
        array
    ), [])
);

const bufferSizes = new Map();
const vaos = new Map();
const bindingPoints = [$.UNIFORM_BUFFER_CAMERA];

for (let i = 0; i < bindingPoints.length; i++)
{
    const bufferId = bindingPoints[i];
    const buffer = getBuffer(bufferId);
    gl.bindBufferBase($.UNIFORM_BUFFER, i, buffer);
}

let oldProgram;
let oldTexture;
