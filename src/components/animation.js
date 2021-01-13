import * as $ from "../const";

export class Animation
{
    constructor(stateModels, stateDelays)
    {
        // map<state, [models]>
        this.stateModels = stateModels;
        this.stateDelays = stateDelays;

        this.models = this.stateModels.get($.ANIM_IDLE);
        this.delays = this.stateDelays.get($.ANIM_IDLE);

        this.delay = this.delays[0];
        this.steps = 0;
    }

    isState(state)
    {
        if (!this.modelIds.has(state))
        {
            throw state;
        }

        return this.state === state;
    }

    setState(state)
    {
        if (!this.modelIds.has(state))
        {
            throw state;
        }

        this.state = state;

        this.stateModels = this.data.get(state);
        this.delay = 0;
    }

    step(dt)
    {
        this.delay += dt;
    }
}
