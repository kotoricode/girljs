import { gl } from "../dom";
import { BufferUniform } from "./buffer";
import { Vao } from "./vao";

export const drawArraysVao = (mode, offset, length, programData) =>
{
    Vao.bind(programData.vao);
    gl.drawArrays(mode, offset, length);
    Vao.unbind();
};

export const setProgram = (programData) =>
{
    const { program, blocks } = programData;

    if (program !== activeProgram)
    {
        gl.useProgram(program);
        activeProgram = program;

        if (blocks)
        {
            for (const blockId of blocks)
            {
                BufferUniform.prepareBlock(program, blockId);
            }
        }
    }
};

let activeProgram;
