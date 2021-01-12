import { SettableArray } from "../settable-array";

export class Vector extends SettableArray
{
    constructor(x=0, y=0, z=0)
    {
        super(x, y, z);
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

    add(vec)
    {
        this.x += vec.x;
        this.y += vec.y;
        this.z += vec.z;
    }

    from(vec)
    {
        this.x = vec.x;
        this.y = vec.y;
        this.z = vec.z;
    }

    cross(vec)
    {
        this.setValues(
            this.y*vec.z - this.z*vec.y,
            this.z*vec.x - this.x*vec.z,
            this.x*vec.y - this.y*vec.x
        );
    }

    dot(vec)
    {
        return this.x*vec.x + this.y*vec.y + this.z*vec.z;
    }

    mulScalar(scalar)
    {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
    }

    mul(vec)
    {
        this.x *= vec.x;
        this.y *= vec.y;
        this.z *= vec.z;
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

    sqrDistance(vec)
    {
        return (this.x-vec.x)**2 + (this.y-vec.y)**2 + (this.z-vec.z)**2;
    }

    sqrMagnitude()
    {
        return this.dot(this);
    }

    sub(vec)
    {
        this.x -= vec.x;
        this.y -= vec.y;
        this.z -= vec.z;
    }
}
