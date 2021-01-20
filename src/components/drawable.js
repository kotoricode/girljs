import { Component } from "./component";
import { ProgramData } from "../gl/program-data";

export class Drawable extends Component
{
    constructor(programId, modelId, uniforms)
    {
        super();

        this.programData = new ProgramData(programId);
        this.isVisible = true;
        this.setModel(modelId);

        if (uniforms)
        {
            for (const [key, value] of uniforms)
            {
                this.programData.stageUniform(key, value);
            }
        }
    }

    setModel(modelId)
    {
        this.programData.setAttributes(modelId);
        this.modelId = modelId;
    }
}
