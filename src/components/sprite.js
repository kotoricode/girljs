import { getSubTextureData, getTextureData } from "../texture";
import { getModel } from "../model";
import { createProgramData, setupModelVao } from "../program";
import { Component } from "./component";

import * as $ from "../const";

export class Sprite extends Component
{
    constructor(programId, modelId, uniforms)
    {
        super();

        this.programId = programId;
        this.programData = createProgramData(this.programId);

        this.setModel(modelId);

        this.isVisible = true;

        // Marks if 3rd party uniforms (e.g. camera matrix) have been set
        this.isInitialized = false;

        if (uniforms)
        {
            for (const [key, value] of uniforms)
            {
                this.setUniform(key, value);
            }
        }
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
            // TODO: rewrite this shit to get values from (sub)textureData
            const uvMinX = this.model.uvCoords[0], // topleft X
                  uvMaxY = this.model.uvCoords[1], // topleft Y
                  uvMaxX = this.model.uvCoords[6], // bottomright X
                  uvMinY = this.model.uvCoords[7]; // bottomright Y

            this.setUniform($.U_UVOFFSET, [uvMinX, uvMinY]);
            this.setUniform($.U_UVSIZE, [uvMaxX - uvMinX, uvMaxY - uvMinY]);
        }
    }

    setUniform(key, value)
    {
        const { uniValues } = this.programData;

        if (!uniValues.has(key))
        {
            throw key;
        }

        if (!Array.isArray(value))
        {
            throw value;
        }

        uniValues.set(key, value);
    }

    setUniformIndex(key, idx, value)
    {
        const { uniValues } = this.programData;

        if (!uniValues.has(key))
        {
            throw key;
        }

        const values = uniValues.get(key);

        if (idx >= values.length)
        {
            throw idx;
        }

        values[idx] = value;
    }
}
