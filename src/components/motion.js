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

    getTarget()
    {
        if (this.index < 0 ||
            this.waypoints.length <= this.index
        ) throw this.index;

        return this.waypoints[this.index];
    }

    hasTarget()
    {
        return this.index > -1;
    }

    resetTargets()
    {
        this.index = this.maxIndex = -1;
    }

    setMainTarget(vec)
    {
        this.waypoints[0].from(vec);
        this.index = this.maxIndex = 0;
    }
}
