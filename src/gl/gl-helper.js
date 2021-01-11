import * as $ from "../const";
import { gl } from "../dom";

export const bindArrayBuffer = (bufferId) =>
{
    if (!buffers.has(bufferId))
    {
        throw bufferId;
    }

    const buffer = buffers.get(bufferId);
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

export const getBufferSize = (bufferId) =>
{
    if (bufferSizes.has(bufferId))
    {
        return bufferSizes.get(bufferId);
    }

    throw bufferId;
};

export const setBufferData = (bufferId, data, usage) =>
{
    bindArrayBuffer(bufferId);
    gl.bufferData($.ARRAY_BUFFER, new Float32Array(data), usage);
    unbindArrayBuffer();

    bufferSizes.set(bufferId, data.length);
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
        $.BUFFER_ARRAY_SPRITE,
        $.BUFFER_ARRAY_POLYGON,
        $.BUFFER_ARRAY_DEBUG,
        $.BUFFER_UNIFORM_VIEWPROJECTION
    ].reduce(
        (array, bufferId) => (
            array.push([bufferId, gl.createBuffer()]),
            array
        ),
        []
    )
);

const bufferSizes = new Map();

const vaos = new Map();

let oldProgram;
let oldTexture;
