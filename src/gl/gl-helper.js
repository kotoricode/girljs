import { gl } from "../dom";
import { Buffer } from "./buffer";
import { VertexArray } from "./vertex-array";

export const drawArraysVao = (mode, offset, length, programData) =>
{
    VertexArray.bind(programData.vao);
    gl.drawArrays(mode, offset, length);
    VertexArray.unbind();
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
                Buffer.prepareBlock(program, blockId);
            }
        }
    }
};

let activeProgram;
