import { Vector2 } from "../math/vector2";
import { Component } from "./component";

export class Motion extends Component
{
    constructor(speed)
    {
        super();

        if (!speed)
        {
            throw Error;
        }

        this.speed = speed;

        this.idx = -1;
        this.maxIdx = -1;
        this.waypoints = [new Vector2()];
    }

    hasTarget()
    {
        return this.idx > -1;
    }

    getTarget()
    {
        return this.waypoints[this.idx];
    }

    resetTargets()
    {
        this.idx = this.maxIdx = -1;
    }

    setMainTarget(vec2)
    {
        this.waypoints[0].copyFrom(vec2);
        this.idx = this.maxIdx = 0;
    }
}
