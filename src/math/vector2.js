import { GameArray } from "../game-array";

export class Vector2 extends GameArray
{
    constructor(x=0, y=0)
    {
        super(x, y);
    }

    static dot(a, b)
    {
        return a.x*b.x + a.y*b.y;
    }

    get x()
    {
        return this[0];
    }

    set x(value)
    {
        this[0] = value;
    }

    get y()
    {
        return this[1];
    }

    set y(value)
    {
        this[1] = value;
    }

    copyFrom(vec2)
    {
        this.x = vec2.x;
        this.y = vec2.y;
    }

    addVec(vec2)
    {
        this.x += vec2.x;
        this.y += vec2.y;
    }

    subVec(vec2)
    {
        this.x -= vec2.x;
        this.y -= vec2.y;
    }

    mulVec(vec2)
    {
        this.x *= vec2.x;
        this.y *= vec2.y;
    }

    mulScalar(s)
    {
        this.x *= s;
        this.y *= s;
    }

    sqrDist(vec3)
    {
        return (this.x - vec3.x) ** 2 +
               (this.y - vec3.y) ** 2;
    }

    sqrMag()
    {
        return this.x**2 + this.y**2;
    }

    normalize(magnitude=1)
    {
        const sqrMag = this.sqrMag();

        if (!sqrMag || magnitude <= 0)
        {
            throw Error;
        }

        this.mulScalar(magnitude / (sqrMag ** 0.5));
    }
}
