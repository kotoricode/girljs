import { Component } from "./component";
import { ProgramData } from "../gl/program-data";

export class UiSprite extends Component
{
    constructor(programId, modelId, uniforms)
    {
        super();

        this.programData = new ProgramData(programId);
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
    }
}
