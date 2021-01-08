import * as $ from "../const";
import { getSubTextureData } from "../gl/texture";
import { getModel } from "../gl/model";
import { createProgramData } from "../gl/program";
import { Component } from "./component";

export class Sprite extends Component
{
    constructor(programId, modelId, uniforms)
    {
        super();

        this.programId = programId;
        this.setModel(modelId);
        this.isVisible = true;

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
        const { meshOffset, uvOffset, uvCoords, subTextureId } = this.model;

        const subTexData = getSubTextureData(subTextureId);
        this.texture = subTexData.baseData.texture;

        const attrOffsets = {
            [$.A_POSITION]: meshOffset,
            [$.A_UV]: uvOffset
        };

        this.programData = createProgramData(this.programId, attrOffsets);

        // Program-specific uniforms
        if (this.programId === $.PROGRAM_TILED)
        {
            const uvMinX = uvCoords[0],
                  uvMinY = uvCoords[5];

            const width = uvCoords[2] - uvMinX,
                  height = uvCoords[1] - uvMinY;

            this.setUniform($.U_UVOFFSET, [uvMinX, uvMinY]);
            this.setUniform($.U_UVSIZE, [width, height]);
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
