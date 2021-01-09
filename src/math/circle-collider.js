import { Vector } from "./vector";

export class CircleCollider
{
    constructor(x, y, radius, anchorX=0, anchorY=0)
    {
        this.radius = radius;
        this.radius2 = radius ** 2;
        this.diameter = radius * 2;

        this.center = new Vector(x, y);
        this.anchor = new Vector(anchorX, anchorY);
    }

    hasPoint(vec2)
    {
        return this.radius2 >= vec2.sqrDistance(this.center);
    }

    setPosition(topLeft)
    {
        this.center.set(
            topLeft.x + this.radius - this.anchor.x*this.diameter,
            topLeft.y + this.radius - this.anchor.y*this.diameter
        );
    }
}
