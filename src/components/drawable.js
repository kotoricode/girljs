import { getTexture } from "../texture";
import { getModel } from "../model";
import { createProgramData } from "../program";
import { Component } from "./component";

import * as CONST from "../const";

export class Drawable extends Component
{
    constructor(programId, textureId, modelId)
    {
        super();

        this.programId = programId;
        this.modelId = modelId;
        this.model = getModel(modelId);
        this.texture = getTexture(textureId);

        this.isVisible = true;

        // Marks if uniforms have been set
        this.isInitialized = false;
    }

    initProgram(attrData)
    {
        this.programData = createProgramData(
            this.programId,
            attrData
        );

        if (this.programId === CONST.PROGRAM_TILED)
        {
            let uvMinX = Infinity,
                uvMinY = Infinity,
                uvMaxX = -Infinity,
                uvMaxY = -Infinity;

            let i = this.model.uvCoords.length;

            while (i)
            {
                const y = this.model.uvCoords[--i];
                uvMinY = Math.min(uvMinY, y);
                uvMaxY = Math.max(uvMaxY, y);

                const x = this.model.uvCoords[--i];
                uvMinX = Math.min(uvMinX, x);
                uvMaxX = Math.max(uvMaxX, x);
            }

            this.setUniform(CONST.U_UVOFFSET, [uvMinX, uvMinY]);

            this.setUniform(CONST.U_UVSIZE, [
                uvMaxX - uvMinX,
                uvMaxY - uvMinY
            ]);
        }
    }

    setUniform(name, values)
    {
        if (!this.programData.uniforms.has(name))
        {
            throw name;
        }

        if (!(values instanceof Array))
        {
            throw values;
        }

        this.programData.uniforms.set(name, values);
    }

    setUniformIndex(name, idx, value)
    {
        if (!this.programData.uniforms.has(name))
        {
            throw name;
        }

        const values = this.programData.uniforms.get(name);

        if (idx >= values.length)
        {
            throw idx;
        }

        values[idx] = value;
    }
}
