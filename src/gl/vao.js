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
    get(obj)
    {
        if (!vaos.has(obj))
        {
            vaos.set(obj, create());
        }

        return vaos.get(obj);
    },
    delete(obj)
    {
        const vao = vaos.get(obj);
        gl.deleteVertexArray(vao);
        vaos.delete(obj);
    },
    init()
    {
        for (const [obj, vao] of vaos)
        {
            if (!isSet(vao))
            {
                vaos.update(obj, create());
                this.prepareModel(obj);
            }
        }
    },
    unbind()
    {
        gl.bindVertexArray(null);
        activeVao = null;
    },
    prepareModel(obj)
    {
        const vao = this.get(obj);
        this.bind(vao);
        Buffer.bind(obj.model.bufferId);

        const { glProgram, aLayout } = obj.getPreparedProgram();

        for (const [name, attribSize] of aLayout)
        {
            const pos = gl.getAttribLocation(glProgram, name);
            gl.enableVertexAttribArray(pos);
            gl.vertexAttribPointer(
                pos,
                attribSize,
                $.FLOAT,
                false,
                0,
                obj.model.attributes.get(name)
            );
        }

        Buffer.unbind(obj.model.bufferId);
        this.unbind();
    }
};

const create = () =>
{
    return gl.createVertexArray();
};

const vaos = new SafeMap();
let activeVao;
