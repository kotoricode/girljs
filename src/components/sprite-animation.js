import * as $ from "../const";
import { Component } from "./component";

export class SpriteAnimation extends Component
{
    constructor(stateModels, stateDelays)
    {
        super();

        this.stateModels = stateModels;
        this.stateDelays = stateDelays;
        this.state = $.ANIM_IDLE;

        this.setState(this.state);
    }

    getModel()
    {
        return this.models[this.frameIdx];
    }

    isState(state)
    {
        return this.state === state;
    }

    setState(state)
    {
        this.state = state;

        if (!this.stateModels.has(state) || !this.stateDelays.has(state))
        {
            throw state;
        }

        this.models = this.stateModels.get(state);
        this.delays = this.stateDelays.get(state);

        this.frameIdx = 0;
        this.delay = this.delays[0];
    }
}
