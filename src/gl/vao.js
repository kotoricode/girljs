import { gl } from "../dom";
import { SafeMap } from "../utils/safe-builtins";

export const Vao = {
    bind(vao)
    {
        gl.bindVertexArray(vao);
    },
    create(programData)
    {
        const vao = gl.createVertexArray();
        vaos.set(programData, vao);

        return vao;
    },
    delete(programData)
    {
        const vao = vaos.get(programData);
        vaos.delete(programData);
        gl.deleteVertexArray(vao);
    },
    unbind()
    {
        Vao.bind(null);
    }
};

const vaos = new SafeMap();
