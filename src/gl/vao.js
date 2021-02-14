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
    prepareModel(shaderProgram)
    {
        const model = shaderProgram.getModel();
        const { bufferId } = model;

        const vao = this.get(shaderProgram);
        this.bind(vao);
        Buffer.bind(bufferId);

        const { program, aLayout } = shaderProgram.getPrepared();

        for (const [name, attribSize] of aLayout)
        {
            const pos = gl.getAttribLocation(program, name);
            gl.enableVertexAttribArray(pos);
            gl.vertexAttribPointer(
                pos,
                attribSize,
                $.FLOAT,
                false,
                0,
                model.attributes.get(name)
            );
        }

        Buffer.unbind(bufferId);
        this.unbind();
    }
};

const create = () =>
{
    return gl.createVertexArray();
};

const vaos = new SafeMap();
let activeVao;
