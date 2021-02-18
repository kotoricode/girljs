import * as $ from "../const";
import { gl } from "../dom";
import { isSet, SafeMap } from "../utility";
import { Buffer } from "./buffer";

export const Vao = {
    bind(vao)
    {
        if (vao !== activeVao)
        {
            activeVao = vao;
            gl.bindVertexArray(activeVao);
        }
    },
    create(program)
    {
        vaos.set(program, create());
    },
    get(program)
    {
        return vaos.get(program);
    },
    delete(program)
    {
        const vao = vaos.get(program);
        gl.deleteVertexArray(vao);
        vaos.delete(program);
    },
    init()
    {
        for (const [program, vao] of vaos)
        {
            if (!isSet(vao))
            {
                vaos.replace(program, create());
                this.prepareModel(program);
            }
        }
    },
    unbind()
    {
        gl.bindVertexArray(null);
        activeVao = null;
    },
    prepareModel(program)
    {
        const model = program.getModel();
        const { glProgram, aLayout } = program.getCompiled();

        const vao = this.get(program);
        this.bind(vao);
        Buffer.bind(model.bufferId);

        for (const [name, attribSize] of aLayout)
        {
            const offset = model.aOffsets.get(name);

            const pos = gl.getAttribLocation(glProgram, name);
            gl.enableVertexAttribArray(pos);
            gl.vertexAttribPointer(
                pos,
                attribSize,
                $.FLOAT,
                false,
                0,
                offset
            );
        }

        Buffer.unbind(model.bufferId);
        this.unbind();
    }
};

const create = () =>
{
    return gl.createVertexArray();
};

const vaos = new SafeMap();
let activeVao;
