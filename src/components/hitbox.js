import { Vector } from "../math/vector";
import { Component } from "./component";

export class HitBox extends Component
{
    constructor(minx, maxx, miny, maxy, minz, maxz)
    {
        super();
        this.min = new Vector(minx, miny, minz);
        this.max = new Vector(maxx, maxy, maxz);
    }
}
