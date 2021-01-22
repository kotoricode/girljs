import { gl } from "../dom";

export const VertexArray = {
    bind(vao)
    {
        gl.bindVertexArray(vao);
    },
    unbind()
    {
        VertexArray.bind(null);
    }
};
