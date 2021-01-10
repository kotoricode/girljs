import { gl } from "../dom";
import { bindBuffer, bindVao, unbindBuffer, unbindVao } from "./gl-helper";
import { getProgram } from "./program";

export class ProgramData
{
    constructor(programId)
    {
        const {
            program,
            attributes,
            uniforms
        } = getProgram(programId);

        this.program = program;
        this.uniforms = uniforms;
        this.uniforms.values = new Map();

        this.vao = gl.createVertexArray();
        this.attributes = attributes;

        for (const [name, defaults] of this.uniforms.defaults)
        {
            this.uniforms.values.set(name, defaults.slice());
        }
    }

    setAttributes(bufferId, attrOffsets)
    {
        bindVao(this.vao);
        bindBuffer(bufferId);

        for (const [name, layout] of Object.entries(this.attributes))
        {
            if (!(name in attrOffsets))
            {
                throw name;
            }

            const pos = gl.getAttribLocation(this.program, name);
            gl.enableVertexAttribArray(pos);
            gl.vertexAttribPointer(pos, ...layout, attrOffsets[name]);
        }

        unbindBuffer();
        unbindVao();
    }

    setUniValue(key, value)
    {
        if (!this.uniforms.values.has(key))
        {
            throw key;
        }

        if (!Array.isArray(value))
        {
            throw value;
        }

        this.uniforms.values.set(key, value);
    }

    setUniValueIndexed(key, idx, value)
    {
        if (!this.uniforms.values.has(key))
        {
            throw key;
        }

        const values = this.uniforms.values.get(key);

        if (!Array.isArray(values))
        {
            throw values;
        }

        if (idx >= values.length)
        {
            throw idx;
        }

        values[idx] = value;
    }

    updateProgramUniform(key, value)
    {
        this.uniforms.setters.get(key)(value);
    }

    updateProgramUniforms()
    {
        for (const [key, value] of this.uniforms.values)
        {
            this.updateProgramUniform(key, value);
        }
    }
}
