import * as $ from "../const";
import { getSubTextureData } from "../gl/texture";
import { getModel } from "../gl/model";
import { createProgramData, setupModelVao } from "../gl/program";
import { Component } from "./component";

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
            for (const [key, value] of Object.entries(uniforms))
            {
                this.setUniform(key, value);
            }
        }
    }

    setModel(modelId)
    {
        this.model = getModel(modelId);
        const subTexData = getSubTextureData(this.model.subTextureId);
        this.texture = subTexData.baseData.texture;

        const { meshOffset, uvOffset, uvCoords } = this.model;

        // Program-specific uniforms
        if (this.programId === $.PROGRAM_TILED)
        {
            const uvMinX = uvCoords[0], // topleft X
                  uvMaxY = uvCoords[1], // topleft Y
                  uvMaxX = uvCoords[6], // bottomright X
                  uvMinY = uvCoords[7]; // bottomright Y

            this.setUniform($.U_UVOFFSET, [uvMinX, uvMinY]);
            this.setUniform($.U_UVSIZE, [uvMaxX - uvMinX, uvMaxY - uvMinY]);
        }

        const attrOffsets = {
            [$.A_POSITION]: meshOffset,
            [$.A_UV]: uvOffset
        };

        setupModelVao(this.programData, attrOffsets);
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

    setUniformIndexed(key, idx, value)
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
