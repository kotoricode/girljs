import { Component } from "./component";
import { Program } from "../gl/program";

export class Drawable extends Component
{
    constructor(programId, priority, modelId, uniforms)
    {
        super();

        this.program = new Program(programId, modelId);
        this.priority = priority;
        this.isVisible = true;

        if (uniforms)
        {
            for (const [key, value] of uniforms)
            {
                this.program.stageUniform(key, value);
            }
        }
    }
}
