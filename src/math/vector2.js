import { getInvViewProjection } from "./camera";
import { Matrix4 } from "./matrix4";
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

        const [x, y] = this;

        const w = ivp[3]*x + ivp[7]*y + ivp[15],
              zw = ivp[11];

        const iwNear = 1 / (w - zw);

        for (let i = 0; i < 2; i++)
        {
            const coord = ivp[i]*x + ivp[4+i]*y + ivp[12+i];
            const zcoord = ivp[8+i];
            this[i] = (coord - zcoord) * iwNear;
        }
    }

    fromMouse(ivp, mouse)
    {
        const [mx, my] = mouse;

        const w = ivp[3]*mx + ivp[7]*my + ivp[15],
              zw = ivp[11];

        const iwNear = 1 / (w - zw),
              iwFar = 1 / (w + zw);

        for (let i = 0; i < 3; i++)
        {
            const coord = ivp[i]*mx + ivp[4+i]*my + ivp[12+i];
            const zcoord = ivp[8+i];
            this.origin[i] = (coord - zcoord) * iwNear;
            this.target[i] = (coord + zcoord) * iwFar;
        }

        this.setDirection();
    }
}
