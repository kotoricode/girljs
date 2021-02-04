import { Vector } from "../math/vector";
import { Component } from "./component";

export class Motion extends Component
{
    constructor(speed)
    {
        if (!speed) throw speed;

        super();
        this.speed = speed;
        this.direction = new Vector();
        this.waypoints = [new Vector()];
        this.resetTargets();
    }

    hasTarget()
    {
        return this.idx > -1;
    }

    getTarget()
    {
        if (this.idx < 0 || this.waypoints.length <= this.idx) throw this.idx;

        return this.waypoints[this.idx];
    }

    resetTargets()
    {
        this.idx = this.maxIdx = -1;
    }

    setMainTarget(vec)
    {
        this.waypoints[0].from(vec);
        this.idx = this.maxIdx = 0;
    }
}
