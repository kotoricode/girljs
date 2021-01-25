import * as $ from "../const";
import { gl } from "../dom";
import { Program } from "./program";
import { Buffer } from "./buffer";
import { VertexArray } from "./vertex-array";
import { SafeMap } from "../utility";
import { Model } from "./model";

export class ProgramData
{
    constructor(programId, modelId)
    {
        const prepared = Program.getPrepared(programId);

        // Program
        this.program = prepared.get($.PROG_DATA_PROGRAM);

        // Attributes
        this.aLayout = prepared.get($.PROG_DATA_A_LAYOUT);
        this.vao = gl.createVertexArray();
        this.setModel(modelId);

        // Uniforms
        this.uSetters = prepared.get($.PROG_DATA_U_SETTERS);
        this.uBlocks = prepared.get($.PROG_DATA_U_BLOCKS);
        this.uStaging = new SafeMap();
        const uDefaults = prepared.get($.PROG_DATA_U_DEFAULTS);

        for (const [name, values] of uDefaults)
        {
            this.uStaging.set(name, values.slice());
        }
    }

    delete()
    {
        gl.deleteVertexArray(this.vao);
    }

    hasStaging(uId)
    {
        return this.uStaging.has(uId);
    }

    setModel(modelId)
    {
        this.modelId = modelId;
        const attributes = Model.getAttributes(modelId);
        const bufferId = Model.getBufferId(modelId);

        VertexArray.bind(this.vao);
        Buffer.bind(bufferId);

        for (const [name, attribSize] of this.aLayout)
        {
            const pos = gl.getAttribLocation(this.program, name);
            gl.enableVertexAttribArray(pos);
            gl.vertexAttribPointer(
                pos,
                attribSize,
                $.FLOAT,
                false,
                0,
                attributes.get(name)
            );
        }

        Buffer.unbind(bufferId);
        VertexArray.unbind();
    }

    setUniforms()
    {
        for (const [key, value] of this.uStaging)
        {
            this.uSetters.get(key)(value);
        }
    }

    stageUniform(key, value)
    {
        if (!Array.isArray(value)) throw Error;

        this.uStaging.update(key, value);
    }

    stageUniformAtIndex(key, idx, value)
    {
        const staged = this.uStaging.get(key);

        if (!Array.isArray(staged) || staged.length <= idx) throw Error;

        staged[idx] = value;
    }
}
