import { gl } from "../dom";
import { Buffer } from "./buffer";
import { VertexArray } from "./vertex-array";

export const drawArraysVao = (mode, length, programData) =>
{
    VertexArray.bind(programData.vao);
    gl.drawArrays(mode, 0, length);
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
