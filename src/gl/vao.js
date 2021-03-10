import * as $ from "../const";
import { gl } from "../main";
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
            if (!vao)
            {
                vaos.set(program, create());
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
        Buffer.bind(model.aBufferId);

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

        Buffer.unbind(model.aBufferId);
        this.unbind();
    }
};

const create = () => gl.createVertexArray();

const vaos = new Map();
let activeVao;
