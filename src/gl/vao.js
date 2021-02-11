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
    create(progObj)
    {
        vaos.set(progObj, create());
    },
    get(progObj)
    {
        return vaos.get(progObj);
    },
    delete(progObj)
    {
        const vao = vaos.get(progObj);
        gl.deleteVertexArray(vao);
        vaos.delete(progObj);
    },
    init()
    {
        for (const [progObj, vao] of vaos)
        {
            if (!isSet(vao))
            {
                vaos.replace(progObj, create());
                this.prepareModel(progObj);
            }
        }
    },
    unbind()
    {
        gl.bindVertexArray(null);
        activeVao = null;
    },
    prepareModel(progObj)
    {
        const { model } = progObj;
        const { bufferId } = model;

        const vao = this.get(progObj);
        this.bind(vao);
        Buffer.bind(bufferId);

        const { glProgram, aLayout } = progObj.getPreparedProgram();

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
