import { gl } from "../dom";
import { BufferUniform } from "./buffer";
import { Vao } from "./vao";

export const drawArraysVao = (mode, offset, length, vao) =>
{
    Vao.bind(vao);
    gl.drawArrays(mode, offset, length);
    Vao.unbind();
};

export const setProgram = (programData) =>
{
    const { program, uniBlocks } = programData;

    if (program !== oldProgram)
    {
        gl.useProgram(program);
        oldProgram = program;

        if (uniBlocks)
        {
            for (const blockId of uniBlocks)
            {
                BufferUniform.prepareBlock(program, blockId);
            }
        }
    }
};

let oldProgram;
