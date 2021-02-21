import * as $ from "../const";
import { Component } from "./component";

export class Anim extends Component
{
    constructor(stateModelIds, stateDelays)
    {
        for (const delay of stateDelays.values())
        {
            if (delay <= 0)
            {
                throw delay;
            }
        }

        super();
        this.stateModelIds = stateModelIds;
        this.stateDelays = stateDelays;
        this.setState($.ANI_IDLE);
    }

    getModelId()
    {
        return this.modelIds[this.frameIndex];
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

        this.frameIndex = 0;
        this.delay = this.delays[0];
    }
}
