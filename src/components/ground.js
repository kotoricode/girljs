import { Component } from "./component";

export class Ground extends Component
{
    constructor(segments)
    {
        if (segments.length < 3) throw segments;

        super();
        this.segments = segments;
        Object.freeze(this);
    }
}
