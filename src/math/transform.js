import { Quaternion } from "./quaternion";
import { Vector3 } from "./vector3";

export class Transform
{
    constructor(tx, ty, tz)
    {
        this.translation = new Vector3(tx, ty, tz);
        this.rotation = new Quaternion();
        this.scale = new Vector3(1, 1, 1);
    }
}
