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
            uniDefaults,
            uniSetters
        } = getProgram(programId);

        this.program = program;
        this.uniSetters = uniSetters;
        this.uniValues = new Map();

        this.vao = gl.createVertexArray();
        this.attributes = attributes;

        for (const [name, defaults] of uniDefaults)
        {
            this.uniValues.set(name, defaults.slice());
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

    setUniform(key, value)
    {
        if (!this.uniValues.has(key))
        {
            throw key;
        }

        if (!Array.isArray(value))
        {
            throw value;
        }

        this.uniValues.set(key, value);
    }

    setUniformIndexed(key, idx, value)
    {
        if (!this.uniValues.has(key))
        {
            throw key;
        }

        const values = this.uniValues.get(key);

        if (idx >= values.length)
        {
            throw idx;
        }

        values[idx] = value;
    }
}
