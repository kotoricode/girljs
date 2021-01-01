import { Point } from "@pixi/math";

export class CircleCollider
{
    constructor(x, y, radius, anchorX, anchorY)
    {
        this.radius = radius;
        this.radius2 = radius ** 2;
        this.diameter = radius * 2;

        this.center = new Point(x, y);
        this.anchor = new Point(anchorX, anchorY);
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
