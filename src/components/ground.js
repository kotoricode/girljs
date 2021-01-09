import { Vector3 } from "../math/vector3";
import { Component } from "./component";

export class Ground extends Component
{
    constructor(minx, maxx, miny, maxy)
    {
        super();
        this.min = new Vector3(minx, miny);
        this.max = new Vector3(maxx, maxy);
    }
}
