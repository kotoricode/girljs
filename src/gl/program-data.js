import * as $ from "../const";
import { gl } from "../dom";
import { getPreparedProgram } from "./program";
import { BufferArray } from "./buffer";
import { Vao } from "./vao";
import { SafeMap } from "../utils/safe-builtins";

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

    setAttributes(bufferId, attribOffsets)
    {
        // TODO: share vaos if program & model are the same
        Vao.bind(this.vao);
        BufferArray.bind(bufferId);

        for (const [name, attribSize] of Object.entries(this.attributes))
        {
            if (!(name in attribOffsets))
            {
                throw name;
            }

            const pos = gl.getAttribLocation(this.program, name);
            gl.enableVertexAttribArray(pos);
            gl.vertexAttribPointer(
                pos, attribSize, $.FLOAT, false, 0, attribOffsets[name]
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
        if (!this.uniforms.staging.has(key))
        {
            throw key;
        }

        if (!Array.isArray(value))
        {
            throw value;
        }

        this.uniforms.staging.set(key, value);
    }

    stageUniformAtIndex(key, idx, value)
    {
        const staging = this.uniforms.staging.get(key);

        if (!Array.isArray(staging))
        {
            throw staging;
        }

        if (idx >= staging.length)
        {
            throw idx;
        }

        staging[idx] = value;
    }
}
