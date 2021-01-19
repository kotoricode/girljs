import { Vector } from "../math/vector";
import { Component } from "./component";

export class Ground extends Component
{
    constructor(minx, maxx, minz, maxz)
    {
        super();
        this.min = new Vector(minx, 0, minz);
        this.max = new Vector(maxx, 0, maxz);
    }
}
