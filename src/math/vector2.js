import { getInvViewProjection } from "./camera";
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

    addVec(vec)
    {
        this.x += vec.x;
        this.y += vec.y;
    }

    copyFrom(vec)
    {
        this.x = vec.x;
        this.y = vec.y;
    }

    mulScalar(s)
    {
        this.x *= s;
        this.y *= s;
    }

    mulVec(vec)
    {
        this.x *= vec.x;
        this.y *= vec.y;
    }

    sqrDistance(vec)
    {
        if (!(vec instanceof Vector2))
        {
            throw Error;
        }

        return (this.x-vec.x)**2 + (this.y-vec.y)**2;
    }

    sqrMagnitude()
    {
        const { x, y } = this;

        return x*x + y*y;
    }

    subVec(vec)
    {
        this.x -= vec.x;
        this.y -= vec.y;
    }

    toWorld()
    {
        const ivp = getInvViewProjection();

        this.set(
            this.x * ivp[0] + ivp[12],
            this.y * ivp[5] + ivp[13]
        );
    }
}
