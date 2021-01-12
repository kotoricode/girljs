import * as $ from "../const";
import { Texture } from "../gl/texture";
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

        this.programData.setAttributes(
            $.BUF_ARR_SPRITE,
            this.attribOffsets
        );

        // Texture
        const subTexData = Texture.getSubTextureData(this.model.subTextureId);
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

        // Program-specific uniforms
        if (this.programData.programId === $.PROG_POLYGON)
        {
            const [
                uvMinX, uvMaxY,
                uvMaxX, ,
                , uvMinY
            ] = this.model.uvCoords;

            const width = uvMaxX - uvMinX;
            const height = uvMaxY - uvMinY;

            this.programData.stageUniform($.U_UVOFFSET, [uvMinX, uvMinY]);
            this.programData.stageUniform($.U_UVSIZE, [width, height]);
        }
    }
}
