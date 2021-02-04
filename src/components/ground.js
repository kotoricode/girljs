import { Component } from "./component";

export class Ground extends Component
{
    constructor(segments)
    {
        super();

        this.segments = segments;
        Object.freeze(this);
    }
}
