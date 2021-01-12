import { gl } from "../dom";
import { BufferUniform } from "./buffer";
import { Vao } from "./vao";

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

export const setProgram = ({ program, uniforms }) =>
{
    if (program !== oldProgram)
    {
        gl.useProgram(program);
        oldProgram = program;

        const { blocks } = uniforms;

        if (blocks)
        {
            for (const blockId of blocks)
            {
                const bufferId = BufferUniform.getBufferByBlock(blockId);
                const bindingPoint = BufferUniform.getBindingPoint(bufferId);
                const blockIdx = gl.getUniformBlockIndex(program, blockId);
                gl.uniformBlockBinding(program, blockIdx, bindingPoint);
            }
        }
    }
};

let oldProgram;
