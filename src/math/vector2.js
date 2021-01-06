import { SettableArray } from "../settable-array";

export class Vector2 extends SettableArray
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

    // Debug stuff in case someone tries to access this as Vector3
    get z() { throw Error; } // eslint-disable-line
    set z(farts) { throw Error; } // eslint-disable-line

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

    sqrDist(vec2)
    {
        return (this.x-vec2.x)**2 + (this.y-vec2.y)**2;
    }

    sqrMag()
    {
        const {x, y} = this;

        return x*x + y*y;
    }

    normalize(magnitude=1)
    {
        const sqrMag = this.sqrMag();

        if (!sqrMag)
        {
            throw Error;
        }

        this.mulScalar(magnitude / (sqrMag ** 0.5));
    }

    toWorld(invViewProjection)
    {
        this.set(
            this.x * invViewProjection[0] + invViewProjection[12],
            this.y * invViewProjection[5] + invViewProjection[13]
        );
    }
}
