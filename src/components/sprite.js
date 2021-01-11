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

        this.attribOffsets = {
            [$.A_POSITION]: null,
            [$.A_UV]: null
        };

        this.setModel(modelId);
        this.setProgramUniforms(uniforms);
    }

    setModel(modelId)
    {
        // Model
        this.model = getModel(modelId);
        this.attribOffsets[$.A_POSITION] = this.model.meshOffset;
        this.attribOffsets[$.A_UV] = this.model.uvOffset;

        this.programData.setAttributes($.BUFFER_ARRAY_SPRITE, this.attribOffsets);

        // Texture
        const subTexData = getSubTextureData(this.model.subTextureId);
        this.texture = subTexData.baseData.texture;
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
