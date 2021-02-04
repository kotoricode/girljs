import * as $ from "../const";
import { Component } from "./component";

export class Anim extends Component
{
    constructor(stateModelIds, stateDelays)
    {
        super();

        this.stateModelIds = stateModelIds;
        this.stateDelays = stateDelays;
        this.setState($.ANI_IDLE);
    }

    getModelId()
    {
        return this.modelIds[this.frameIdx];
    }

    isState(state)
    {
        return this.state === state;
    }

    setState(state)
    {
        this.state = state;

        this.modelIds = this.stateModelIds.get(state);
        this.delays = this.stateDelays.get(state);

        this.frameIdx = 0;
        this.delay = this.delays[0];
    }
}
