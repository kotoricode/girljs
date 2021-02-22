import { SettableArray } from "../utility";

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

    copy(vec)
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

    distance(vec)
    {
        return this.sqrDistance(vec) ** 0.5;
    }

    dot(vec)
    {
        return this.x*vec.x + this.y*vec.y + this.z*vec.z;
    }

    multiply(vec)
    {
        this.x *= vec.x;
        this.y *= vec.y;
        this.z *= vec.z;
    }

    magnitude()
    {
        return this.dot(this) ** 0.5;
    }

    normalize(toMagnitude=1)
    {
        let magnitude = this.magnitude();

        if (!magnitude)
        {
            console.warn("Vector magnitude must be non-zero");
            magnitude = Number.EPSILON;
        }

        const scalar = toMagnitude / magnitude;

        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
    }

    subtract(vec)
    {
        this.x -= vec.x;
        this.y -= vec.y;
        this.z -= vec.z;
    }

    sqrDistance(vec)
    {
        return (this.x - vec.x) ** 2 +
               (this.y - vec.y) ** 2 +
               (this.z - vec.z) ** 2;
    }
}
