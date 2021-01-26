import { Matrix } from "../math/matrix";
import { Transform } from "../math/transform";
import { Component } from "./component";

export class Space extends Component
{
    constructor(tx=0, ty=0, tz=0)
    {
        super();
        this.children = new Set();

        this.matrix = new Matrix();
        this.local = new Transform(tx, ty, tz);
        this.world = new Transform();
    }

    setParent(space)
    {
        this.parent = space;
    }

    addChild(space)
    {
        this.children.add(space);
    }
}
