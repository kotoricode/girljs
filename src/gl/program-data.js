import * as $ from "../const";
import { gl } from "../dom";
import { Program } from "./program";
import { BufferArray } from "./buffer";
import { Vao } from "./vao";
import { SafeMap } from "../utility";
import { Model } from "./model";

export class ProgramData
{
    constructor(programId)
    {
        const prepared = Program.getPrepared(programId);

        // Program
        this.program = prepared.get($.PROG_DATA_PROGRAM);
        this.programId = programId;

        // Attributes
        this.attributes = prepared.get($.PROG_DATA_ATTRIBUTES);
        this.vao = gl.createVertexArray();

        // Uniforms
        this.setters = prepared.get($.PROG_DATA_SETTERS);
        this.blocks = prepared.get($.PROG_DATA_BLOCKS);
        this.staging = new SafeMap();
        const defaults = prepared.get($.PROG_DATA_DEFAULTS);

        for (const [name, values] of defaults)
        {
            this.staging.set(name, values.slice());
        }
    }

    delete()
    {
        gl.deleteVertexArray(this.vao);
    }

    setAttributes(modelId)
    {
        const model = Model.get(modelId);
        const bufferId = Model.getBufferId(modelId);

        Vao.bind(this.vao);
        BufferArray.bind(bufferId);

        for (const [name, attribSize] of this.attributes)
        {
            const pos = gl.getAttribLocation(this.program, name);
            gl.enableVertexAttribArray(pos);
            gl.vertexAttribPointer(
                pos,
                attribSize,
                $.FLOAT,
                false,
                0,
                model.get(name)
            );
        }

        BufferArray.unbind();
        Vao.unbind();
    }

    setUniforms()
    {
        for (const [key, value] of this.staging)
        {
            this.setters.get(key)(value);
        }
    }

    stageUniform(key, value)
    {
        if (!Array.isArray(value)) throw Error;

        this.staging.update(key, value);
    }

    stageUniformAtIndex(key, idx, value)
    {
        const staged = this.staging.get(key);

        if (!Array.isArray(staged) || staged.length <= idx) throw Error;

        staged[idx] = value;
    }
}
