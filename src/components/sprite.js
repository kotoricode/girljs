import * as $ from "../const";
import { Model } from "../gl/model";
import { Component } from "./component";
import { ProgramData } from "../gl/program-data";
import { SafeMap } from "../utils/better-builtins";

export class Sprite extends Component
{
    constructor(programId, modelId, uniforms)
    {
        super();

        this.programData = new ProgramData(programId);
        this.isVisible = true;

        this.attribOffsets = new SafeMap([
            [$.A_XYZ, null],
            [$.A_UV, null]
        ]);

        this.setModel(modelId);
        this.setProgramUniforms(uniforms);
    }

    setModel(modelId)
    {
        this.model = Model.get(modelId);

        this.attribOffsets.set($.A_XYZ, this.model.xyzOffset);
        this.attribOffsets.set($.A_UV, this.model.uvOffset);
        this.programData.setAttributes($.BUF_ARR_SPRITE, this.attribOffsets);

        this.texture = Model.getTexture(modelId);
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
            const [uvMinX, uvMaxY, uvMaxX, , , uvMinY] = this.model.uv;

            const width = uvMaxX - uvMinX;
            const height = uvMaxY - uvMinY;

            this.programData.stageUniform($.U_UVOFFSET, [uvMinX, uvMinY]);
            this.programData.stageUniform($.U_UVSIZE, [width, height]);
        }
    }
}
