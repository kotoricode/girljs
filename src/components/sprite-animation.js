import * as $ from "../const";
import { Component } from "./component";

export class SpriteAnimation extends Component
{
    constructor(stateModels, frameDelay)
    {
        super();

        this.stateModels = stateModels;
        this.frameDelay = frameDelay;
        this.delay = frameDelay;

        this.models = stateModels.get($.ANIM_IDLE);
        this.frameIdx = 0;
    }
}
