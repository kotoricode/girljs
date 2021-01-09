import { Vector2 } from "../math/vector2";
import { Component } from "./component";

export class Ground extends Component
{
    constructor(minx, maxx, miny, maxy)
    {
        super();
        this.min = new Vector2(minx, miny);
        this.max = new Vector2(maxx, maxy);
    }
}
