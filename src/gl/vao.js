import { gl } from "../dom";

export const Vao = {
    bind(vao)
    {
        gl.bindVertexArray(vao);
    },
    unbind()
    {
        Vao.bind(null);
    }
};
