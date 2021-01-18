import { Matrix } from "../math/matrix";
import { Transform } from "../math/transform";
import { Component } from "./component";

export class Space extends Component
{
    constructor(tx=0, ty=0, tz=0)
    {
        super();

        this.matrix = new Matrix();
        this.isDirty = true;

        this.local = new Transform(tx, ty, tz);
        this.world = new Transform();
    }
}
