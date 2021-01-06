import { VectorBase } from "./vector-base";

export class Vector3 extends VectorBase
{
    constructor(x=0, y=0, z=0)
    {
        super(x, y);
        this.z = z;
    }

    static dot(a, b)
    {
        if (!(a instanceof Vector3 && b instanceof Vector3))
        {
            throw Error;
        }

        return a.x*b.x + a.y*b.y + a.z*b.z;
    }

    get z()
    {
        return this[2];
    }

    set z(value)
    {
        this[2] = value;
    }

    // Looped to work with both Vector2 & Vector3
    copyFrom(vec)
    {
        for (let i = 0; i < vec.length; i++)
        {
            this[i] = vec[i];
        }
    }

    addVec(vec)
    {
        for (let i = 0; i < vec.length; i++)
        {
            this[i] += vec[i];
        }
    }

    subVec(vec)
    {
        for (let i = 0; i < vec.length; i++)
        {
            this[i] -= vec[i];
        }
    }

    mulVec(vec)
    {
        for (let i = 0; i < vec.length; i++)
        {
            this[i] *= vec[i];
        }
    }

    mulScalar(s)
    {
        this.x *= s;
        this.y *= s;
        this.z *= s;
    }

    cross(a, b)
    {
        if (!(a instanceof Vector3 && b instanceof Vector3))
        {
            throw Error;
        }

        this.setValues(
            a.y*b.z - a.z*b.y,
            a.z*b.x - a.x*b.z,
            a.x*b.y - a.y*b.x
        );
    }

    sqrDist(vec3)
    {
        if (!(vec3 instanceof Vector3))
        {
            throw Error;
        }

        return (this.x-vec3.x)**2 + (this.y-vec3.y)**2 + (this.z-vec3.z)**2;
    }

    sqrMag()
    {
        const {x, y, z} = this;

        return x*x + y*y + z*z;
    }
}
