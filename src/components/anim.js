import * as $ from "../const";
import { Component } from "./component";

export class Anim extends Component
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

        this.models = this.stateModels.get(state);
        this.delays = this.stateDelays.get(state);

        this.frameIdx = 0;
        this.delay = this.delays[0];
    }
}
