import * as $ from "../const";
import { gl } from "../dom";

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

let oldProgram;
let oldTexture;
