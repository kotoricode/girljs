import { Quaternion } from "./quaternion";
import { Vector } from "./vector";

export class Transform
{
    constructor(tx, ty, tz)
    {
        this.translation = new Vector(tx, ty, tz);
        this.rotation = new Quaternion();
        this.scale = new Vector(1, 1, 1);
    }
}
