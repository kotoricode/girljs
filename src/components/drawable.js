import { Component } from "./component";
import { ProgramData } from "../gl/program-data";

export class Drawable extends Component
{
    constructor(programId, priority, modelId, uniforms)
    {
        super();

        this.programData = new ProgramData(programId, modelId);
        this.priority = priority;
        this.isVisible = true;

        if (uniforms)
        {
            for (const [key, value] of uniforms)
            {
                this.programData.stageUniform(key, value);
            }
        }
    }
}
