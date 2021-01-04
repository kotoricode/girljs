import { getSubTextureData, getTextureData } from "../texture";
import { getModel } from "../model";
import { createProgramData, setupModelVao } from "../program";
import { Component } from "./component";

import * as $ from "../const";

export class Sprite extends Component
{
    constructor(programId, modelId)
    {
        super();

        this.programId = programId;
        this.programData = createProgramData(this.programId);

        this.setModel(modelId);

        this.isVisible = true;

        // Marks if 3rd party uniforms (e.g. camera matrix) have been set
        this.isInitialized = false;
    }

    setModel(modelId)
    {
        this.model = getModel(modelId);
        const subTextureData = getSubTextureData(this.model.subTextureId);
        const textureData = getTextureData(subTextureData.baseTextureId);
        this.texture = textureData.texture;

        this.setupModelUniforms();

        const { meshOffset, uvOffset } = this.model;

        const attrOffsets = {
            [$.A_POSITION]: meshOffset,
            [$.A_UV]: uvOffset
        };

        setupModelVao(this.programData, attrOffsets);
    }

    setupModelUniforms()
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
