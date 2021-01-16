import { gl } from "../dom";
import { BufferUniform } from "./buffer";
import { Vao } from "./vao";

export const drawArrays = (mode, offset, length) => gl.drawArrays(
    mode, offset, length
);

export const drawArraysVao = (mode, offset, length, vao) =>
{
    Vao.bind(vao);
    drawArrays(mode, offset, length);
    Vao.unbind();
};

export const setProgram = (programData) =>
{
    const { program, uniforms } = programData;

    if (program !== oldProgram)
    {
        gl.useProgram(program);
        oldProgram = program;

        if (uniforms.blocks)
        {
            for (const blockId of uniforms.blocks)
            {
                BufferUniform.prepareBlock(program, blockId);
            }
        }
    }
};

let oldProgram;
