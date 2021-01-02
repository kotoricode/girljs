import { Matrix4 } from "../math/matrix4";
import { Quaternion } from "../math/quaternion";
import { Vector3 } from "../math/vector3";
import { Component } from "./component";

export class Transform extends Component
{
    constructor(tx=0, ty=0, tz=0)
    {
        super();
        this.matrix = new Matrix4();
        this.isDirty = true;

        this.local = {
            scale: new Vector3(1, 1, 1),
            rotation: new Quaternion(),
            translation: new Vector3(tx, ty, tz)
        };

        // Set by scenegraph
        this.world = {
            scale: new Vector3(),
            rotation: new Quaternion(),
            translation: new Vector3()
        };
    }
}
