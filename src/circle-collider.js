import { Vector3 } from "./math/vector3";

export class CircleCollider
{
    constructor(x, y, radius, anchorX, anchorY)
    {
        this.radius = radius;
        this.radius2 = radius ** 2;
        this.diameter = radius * 2;

        this.center = new Vector3(x, y, 0);
        this.anchor = new Vector3(anchorX, anchorY, 0);
    }

    hasPoint(vec2)
    {
        return this.radius2 >= vec2.sqrDist(this.center);
    }

    setPosition(topLeft)
    {
        this.center.set(
            topLeft.x + this.radius - this.anchor.x * this.diameter,
            topLeft.y + this.radius - this.anchor.y * this.diameter
        );
    }
}
