import { getTexture } from "../texture";
import { getModel } from "../model";
import { createProgramData, setupModelVao } from "../program";
import { Component } from "./component";

import * as $ from "../const";

export class Sprite extends Component
{
    constructor(programId, textureId, modelId)
    {
        super();

        this.programId = programId;

        this.setModel(modelId);
        this.texture = getTexture(textureId);

        this.isVisible = true;

        // Marks if uniforms have been set
        this.isInitialized = false;

        this.programData = createProgramData(this.programId);
        this.setupUniforms();
    }

    setModel(modelId)
    {
        this.model = getModel(modelId);
    }

    setSprite(modelId)
    {
        this.setModel(modelId);

        const { meshOffset, uvOffset } = this.model;

        const offsets = {
            [$.A_POSITION]: meshOffset,
            [$.A_UV]: uvOffset
        };

        this.setupAttributes(offsets);
    }

    setupAttributes(attrOffsets)
    {
        setupModelVao(this.programData, attrOffsets);
    }

    setupUniforms()
    {
        if (this.programId === $.PROGRAM_TILED)
        {
            const uvMinX = this.model.uvCoords[0], // topleft X
                  uvMaxY = this.model.uvCoords[1], // topleft Y
                  uvMaxX = this.model.uvCoords[6], // bottomright X
                  uvMinY = this.model.uvCoords[7]; // bottomright Y

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
