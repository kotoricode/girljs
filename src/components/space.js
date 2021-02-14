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

    attachTo(parent)
    {
        this.parent = parent;
        parent.children.add(this);
    }

    detach()
    {
        if (!this.parent) throw Error("Missing parent");

        this.parent.children.delete(this);
        this.parent = null;
    }
}
