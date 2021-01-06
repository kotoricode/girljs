import { VectorBase } from "./vector-base";

export class Vector2 extends VectorBase
{
    constructor(x=0, y=0)
    {
        super(x, y);
    }

    static dot(a, b)
    {
        return a.x*b.x + a.y*b.y;
    }

    copyFrom({ x, y })
    {
        this.x = x;
        this.y = y;
    }

    addVec({ x, y })
    {
        this.x += x;
        this.y += y;
    }

    subVec({ x, y })
    {
        this.x -= x;
        this.y -= y;
    }

    mulVec({ x, y })
    {
        this.x *= x;
        this.y *= y;
    }

    mulScalar(s)
    {
        this.x *= s;
        this.y *= s;
    }

    sqrDist(vec)
    {
        if (!(vec instanceof Vector2))
        {
            throw Error;
        }

        return (this.x-vec.x)**2 + (this.y-vec.y)**2;
    }

    sqrMag()
    {
        const { x, y } = this;

        return x*x + y*y;
    }

    toWorld(invViewProjection)
    {
        this.set(
            this.x * invViewProjection[0] + invViewProjection[12],
            this.y * invViewProjection[5] + invViewProjection[13]
        );
    }
}
