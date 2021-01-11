import * as $ from "../const";
import { gl } from "../dom";
import { getProgram } from "./program";
import {
    bindBuffer, bindVao, createVao, deleteVao, unbindBuffer, unbindVao
} from "./gl-helper";

export class ProgramData
{
    constructor(programId)
    {
        const { program, attributes, uniforms } = getProgram(programId);

        this.programId = programId;
        this.program = program;
        this.uniforms = uniforms;
        this.uniforms.staging = new Map();

        // TODO: maybe pool vaos?
        this.vao = createVao(this);
        this.attributes = attributes;

        for (const [name, defaults] of this.uniforms.defaults)
        {
            this.uniforms.staging.set(name, defaults.slice());
        }
    }

    delete()
    {
        deleteVao(this);
    }

    setAttributes(bufferId, attribOffsets)
    {
        // TODO: share vaos if program & model are the same
        bindVao(this.vao);
        bindBuffer(bufferId);

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

        unbindBuffer();
        unbindVao();
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
        if (!this.uniforms.staging.has(key))
        {
            throw key;
        }

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
