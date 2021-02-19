import { Component } from "./component";

export class Button extends Component
{
    constructor(minx, maxx, miny, maxy)
    {
        super();
        this.minx = minx;
        this.maxx = maxx;
        this.miny = miny;
        this.maxy = maxy;
        this.isClickable = true;
    }
}
