import * as $ from "../const";
import { Component } from "./component";

export class SpriteAnimation extends Component
{
    constructor(stateModels, stateDelays)
    {
        super();

        this.stateModels = stateModels;
        this.stateDelays = stateDelays;

        this.models = stateModels.get($.ANIM_IDLE);
        this.delays = stateDelays.get($.ANIM_IDLE);

        if (!Array.isArray(this.models) || !Array.isArray(this.delays))
        {
            throw Error;
        }

        this.frameIdx = 0;
        this.delay = 0;
    }
}
