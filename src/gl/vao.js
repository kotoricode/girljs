import { gl } from "../dom";

export const bindVao = (vao) =>
{
    gl.bindVertexArray(vao);
};

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

export const unbindVao = () =>
{
    bindVao(null);
};

const vaos = new Map();
