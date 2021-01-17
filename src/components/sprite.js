import * as $ from "../const";
import { Model } from "../gl/model";
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

        if (uniforms)
        {
            this.setProgramUniforms(uniforms);
        }
    }

    setModel(modelId)
    {
        this.programData.setAttributes(modelId);
        this.modelId = modelId;
    }

    setProgramUniforms(uniforms)
    {
        for (const [key, value] of Object.entries(uniforms))
        {
            this.programData.stageUniform(key, value);
        }

        // Program-specific uniforms
        if (this.programData.programId === $.PROG_POLYGON)
        {
            const [
                uvMinX, uvMaxY,
                uvMaxX, ,
                , uvMinY
            ] = Model.getUv(this.modelId);

            const width = uvMaxX - uvMinX;
            const height = uvMaxY - uvMinY;

            this.programData.stageUniform($.U_UVOFFSET, [uvMinX, uvMinY]);
            this.programData.stageUniform($.U_UVSIZE, [width, height]);
        }
    }
}
