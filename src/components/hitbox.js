import { Vector } from "../math/vector";
import { Component } from "./component";

export class HitBox extends Component
{
    constructor(minx, maxx, miny, maxy, minz, maxz)
    {
        super();
        this.minBounds = new Vector(minx, miny, minz);
        this.maxBounds = new Vector(maxx, maxy, maxz);
        this.min = new Vector();
        this.max = new Vector();
        Object.freeze(this);
    }
}
