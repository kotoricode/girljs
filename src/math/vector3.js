import { SettableArray } from "./settable-array";

export class Vector3 extends SettableArray
{
    constructor(x=0, y=0, z=0)
    {
        super(x, y, z);
    }

    static dot(a, b)
    {
        if (!(a instanceof Vector3 && b instanceof Vector3))
        {
            throw Error;
        }

        return a.x*b.x + a.y*b.y + a.z*b.z;
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

    get z()
    {
        return this[2];
    }

    set z(value)
    {
        this[2] = value;
    }

    addVec(vec)
    {
        for (let i = 0; i < vec.length; i++)
        {
            this[i] += vec[i];
        }
    }

    copyFrom(vec)
    {
        for (let i = 0; i < vec.length; i++)
        {
            this[i] = vec[i];
        }
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

    mulScalar(s)
    {
        this.x *= s;
        this.y *= s;
        this.z *= s;
    }

    mulVec(vec)
    {
        for (let i = 0; i < vec.length; i++)
        {
            this[i] *= vec[i];
        }
    }

    sqrDistance(vec3)
    {
        if (!(vec3 instanceof Vector3))
        {
            throw Error;
        }

        return (this.x-vec3.x)**2 + (this.y-vec3.y)**2 + (this.z-vec3.z)**2;
    }

    subVec(vec)
    {
        for (let i = 0; i < vec.length; i++)
        {
            this[i] -= vec[i];
        }
    }

    magnitude()
    {
        return this.sqrMagnitude() ** 0.5;
    }

    normalize(toMagnitude=1)
    {
        const magnitude = this.magnitude();

        if (!magnitude)
        {
            throw Error;
        }

        this.mulScalar(toMagnitude / magnitude);
    }

    sqrMagnitude()
    {
        return this.reduce((acc, val) => acc + val**2, 0);
    }
}
