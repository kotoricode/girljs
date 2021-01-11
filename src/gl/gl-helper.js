import { gl } from "../dom";
import { bindingPoints, blockBuffers } from "./buffer";
import { Vao } from "./vao";

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

let oldProgram;
