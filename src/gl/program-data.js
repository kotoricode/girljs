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

        this.programId = programId;
        this.program = prepared.get($.PROG_DATA_PROGRAM);
        this.uniSetters = prepared.get($.PROG_DATA_UNI_SETTERS);
        this.attributes = prepared.get($.PROG_DATA_ATTRIBUTES);
        this.uniBlocks = prepared.get($.PROG_DATA_UNI_BLOCKS);

        this.uniStaging = new SafeMap();
        this.vao = gl.createVertexArray();

        const defaults = prepared.get($.PROG_DATA_UNI_DEFAULTS);

        for (const [name, values] of defaults)
        {
            this.uniStaging.set(name, values.slice());
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
        for (const [key, value] of this.uniStaging)
        {
            this.uniSetters.get(key)(value);
        }
    }

    stageUniform(key, value)
    {
        if (!Array.isArray(value)) throw Error;

        this.uniStaging.update(key, value);
    }

    stageUniformAtIndex(key, idx, value)
    {
        const staged = this.uniStaging.get(key);

        if (!Array.isArray(staged) || staged.length <= idx) throw Error;

        staged[idx] = value;
    }
}
