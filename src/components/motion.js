import { Vector } from "../math/vector";
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
        this.direction = new Vector();

        this.idx = -1;
        this.maxIdx = -1;
        this.waypoints = [new Vector()];
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

    setMainTarget(vec)
    {
        this.waypoints[0].copyFrom(vec);
        this.idx = this.maxIdx = 0;
    }
}
