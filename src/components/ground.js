import { Vector } from "../math/vector";
import { Component } from "./component";

export class Ground extends Component
{
    constructor(minx, maxx, miny, maxy)
    {
        super();
        this.min = new Vector(minx, miny);
        this.max = new Vector(maxx, maxy);
    }
}
