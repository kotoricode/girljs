import * as $ from "../const";
import { gl } from "../dom";
import { getPreparedProgram } from "./program";
import { BufferArray } from "./buffer";
import { Vao } from "./vao";
import { SafeMap } from "../utils/better-builtins";
import { Model } from "./model";

export class ProgramData
{
    constructor(programId)
    {
        const prepared = getPreparedProgram(programId);

        this.programId = programId;
        this.program = prepared.program;
        this.uniforms = prepared.uniforms;
        this.uniforms.staging = new SafeMap();

        // TODO: maybe pool vaos?
        this.vao = Vao.create(this);
        this.attributes = prepared.attributes;

        for (const [name, defaults] of this.uniforms.defaults)
        {
            this.uniforms.staging.set(name, defaults.slice());
        }
    }

    delete()
    {
        Vao.delete(this);
    }

    setAttributes(modelId)
    {
        const model = Model.get(modelId);
        const bufferId = Model.getBufferId(modelId);

        Vao.bind(this.vao);
        BufferArray.bind(bufferId);

        for (const [name, attribSize] of Object.entries(this.attributes))
        {
            const pos = gl.getAttribLocation(this.program, name);
            gl.enableVertexAttribArray(pos);
            gl.vertexAttribPointer(
                pos, attribSize, $.FLOAT, false, 0, model.get(name)
            );
        }

        BufferArray.unbind();
        Vao.unbind();
    }

    setUniform(key, value)
    {
        this.uniforms.setters.get(key)(value);
    }

    setUniforms()
    {
        for (const [key, value] of this.uniforms.staging)
        {
            this.setUniform(key, value);
        }
    }

    stageUniform(key, value)
    {
        if (!Array.isArray(value))
        {
            throw Error;
        }

        this.uniforms.staging.update(key, value);
    }

    stageUniformAtIndex(key, idx, value)
    {
        const staged = this.uniforms.staging.get(key);

        if (!Array.isArray(staged))
        {
            throw Error;
        }

        if (staged.length <= idx)
        {
            throw Error;
        }

        staged[idx] = value;
    }
}
