import * as $ from "../const";
import { getSubTextureData } from "../gl/texture";
import { getModel } from "../gl/model";
import { Component } from "./component";
import { ProgramData } from "../gl/program-data";

export class Sprite extends Component
{
    constructor(programId, modelId, uniforms)
    {
        super();

        this.programData = new ProgramData(programId);
        this.isVisible = true;

        this.setModel(modelId);
        this.setProgramUniforms(uniforms);
    }

    setModel(modelId)
    {
        this.model = getModel(modelId);
        const { meshOffset, uvOffset, subTextureId } = this.model;

        const subTexData = getSubTextureData(subTextureId);
        this.texture = subTexData.baseData.texture;

        const attribOffsets = {
            [$.A_POSITION]: meshOffset,
            [$.A_UV]: uvOffset
        };

        this.programData.setAttributes($.BUFFER_SPRITE, attribOffsets);
    }

    setProgramUniforms(uniforms)
    {
        if (uniforms)
        {
            for (const [key, value] of Object.entries(uniforms))
            {
                this.programData.stageUniform(key, value);
            }
        }

        const { uvCoords } = this.model;

        // Program-specific uniforms
        if (this.programData.programId === $.PROGRAM_TILED)
        {
            const uvMinX = uvCoords[0],
                  uvMinY = uvCoords[5];

            const width = uvCoords[2] - uvMinX,
                  height = uvCoords[1] - uvMinY;

            this.programData.stageUniform($.U_UVOFFSET, [uvMinX, uvMinY]);
            this.programData.stageUniform($.U_UVSIZE, [width, height]);
        }
    }
}
