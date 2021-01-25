import { Component } from "./component";
import { ProgramData } from "../gl/program-data";

export class Drawable extends Component
{
    constructor(programId, priority, modelId, uniforms)
    {
        super();

        this.programData = new ProgramData(programId);
        this.priority = priority;
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
