import { Matrix4 } from "../math/matrix4";
import { Ray } from "../math/ray";
import { Vector3 } from "../math/vector3";
import { Component } from "./component";

export class Camera extends Component
{
    constructor(halfHeight, aspect, nearPlane, farPlane)
    {
        super();

        // ViewProjection matrix multipliers
        const invFrustumLength = 1 / (farPlane - nearPlane);
        this.vpL5 = 1 / halfHeight;
        this.vpL0 = this.vpL5 / aspect;
        this.vpLA = -2 * invFrustumLength;
        this.vpLE = -(farPlane+nearPlane) * invFrustumLength;

        this.ray = new Ray(
            new Vector3(),
            new Vector3(0, 0, 1)
        );

        this.viewProjection = new Matrix4();
        this.invViewProjection = new Matrix4();
    }
}
