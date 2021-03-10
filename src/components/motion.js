import { Vector } from "../math/vector";
import { Component } from "./component";

export class Motion extends Component
{
    constructor(speed)
    {
        if (speed <= 0) throw speed;

        super();
        this.speed = speed;
        this.direction = new Vector();
        this.waypoints = [new Vector()];
        this.index = -1;
        this.maxIndex = -1;
    }

    getTarget()
    {
        if (this.index < 0) throw Error;
        if (this.waypoints.length <= this.index) throw this.index;

        return this.waypoints[this.index];
    }

    hasTarget()
    {
        return this.index > -1;
    }

    setMainTarget(vec)
    {
        this.waypoints[0].copy(vec);
        this.index = this.maxIndex = 0;
    }

    stop()
    {
        this.direction.setValues(0, 0, 0);
        this.index = this.maxIndex = -1;
    }
}
