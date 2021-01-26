import { gl } from "../dom";
import { Buffer } from "./buffer";
import { VertexArray } from "./vertex-array";

export const drawArraysVao = (mode, length, program) =>
{
    VertexArray.bind(program.vao);
    gl.drawArrays(mode, 0, length);
    VertexArray.unbind();
};

export const setProgram = (program) =>
{
    const { glProgram, blocks } = program;

    if (glProgram !== activeGlProgram)
    {
        gl.useProgram(glProgram);
        activeGlProgram = glProgram;

        if (blocks)
        {
            for (const blockId of blocks)
            {
                Buffer.prepareBlock(glProgram, blockId);
            }
        }
    }
};

let activeGlProgram;
