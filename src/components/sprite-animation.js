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
        this.frameIdx = 0;
    }
}
