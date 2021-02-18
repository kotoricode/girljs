import { Component } from "./component";

export class Ground extends Component
{
    constructor(minx, maxx, minz, maxz)
    {
        super();
        this.minx = minx;
        this.maxx = maxx;
        this.minz = minz;
        this.maxz = maxz;
        Object.freeze(this);
    }
}
