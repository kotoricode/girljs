import * as $ from "../const";
import { gl } from "../dom";

export const createBuffer = () => gl.createBuffer();
export const createTexture = () => gl.createTexture();

export const useProgram = (program) =>
{
    if (program !== oldProgram)
    {
        gl.useProgram(program);
        oldProgram = program;
    }
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

export const bindBuffer = (bufferId) =>
{
    if (activeBuffer)
    {
        throw Error(`${bufferId}, ${activeBuffer}`);
    }

    if (!buffers.has(bufferId))
    {
        throw bufferId;
    }

    activeBuffer = bufferId;
    const buffer = buffers.get(bufferId);
    gl.bindBuffer($.ARRAY_BUFFER, buffer);
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
    bindBuffer(bufferId);
    gl.bufferData($.ARRAY_BUFFER, new Float32Array(data), usage);
    unbindBuffer();

    bufferSizes.set(bufferId, data.length);
};

export const unbindBuffer = () =>
{
    activeBuffer = null;
    gl.bindBuffer($.ARRAY_BUFFER, null);
};

const buffers = new Map([
    [ $.BUFFER_MODEL, createBuffer() ],
    [ $.BUFFER_DEBUG, createBuffer() ]
]);

const bufferSizes = new Map();

let activeBuffer;
let oldProgram;
let oldTexture;
