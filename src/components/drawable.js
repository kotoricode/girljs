import { Component } from "./component";
import { ShaderProgram } from "../gl/shader-program";

export class Drawable extends Component
{
    constructor(programId, priority, modelId, uniforms)
    {
        super();
        this.program = new ShaderProgram(programId, modelId);
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
