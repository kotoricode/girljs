import { getTexture } from "../texture";
import { getModel, getModelBuffer } from "../model";
import { createProgramData, setupAttributes } from "../program";
import { Component } from "./component";

import * as $ from "../const";
import { gl } from "../dom";

export class Drawable extends Component
{
    constructor(programId, textureId, modelId)
    {
        super();

        this.programId = programId;
        this.modelId = modelId;

        // TODO: combine model & texture into sprite
        this.model = getModel(modelId);
        this.texture = getTexture(textureId);

        this.isVisible = true;

        // Marks if uniforms have been set
        this.isInitialized = false;
    }

    initProgramData(attrOffsets)
    {
        this.programData = createProgramData(this.programId);

        setupAttributes(this.programData, attrOffsets);

        if (this.programId === $.PROGRAM_TILED)
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

            this.setUniform($.U_UVOFFSET, [uvMinX, uvMinY]);

            this.setUniform($.U_UVSIZE, [
                uvMaxX - uvMinX,
                uvMaxY - uvMinY
            ]);
        }
    }

    setUniform(name, values)
    {
        const { uniValues } = this.programData;

        if (!uniValues.has(name))
        {
            throw name;
        }

        if (!(values instanceof Array))
        {
            throw values;
        }

        uniValues.set(name, values);
    }

    setUniformIndex(name, idx, value)
    {
        const { uniValues } = this.programData;

        if (!uniValues.has(name))
        {
            throw name;
        }

        const values = uniValues.get(name);

        if (idx >= values.length)
        {
            throw idx;
        }

        values[idx] = value;
    }
}
