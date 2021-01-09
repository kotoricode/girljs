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

    subVec(vec)
    {
        this.x -= vec.x;
        this.y -= vec.y;
    }

    toWorld()
    {
        const ivp = getInvViewProjection();

        const [x, y] = this;
        const w = (ivp[3]*x + ivp[7]*y + ivp[15] - ivp[11]);

        this.set(
            (ivp[0]*x + ivp[4]*y + ivp[12] - ivp[8]) / w,
            (ivp[1]*x + ivp[5]*y + ivp[13] - ivp[9]) / w
        );
    }
}
