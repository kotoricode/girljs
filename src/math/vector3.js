import { GameArray } from "../game-array";

export class Vector3 extends GameArray
{
    constructor(x=0, y=0, z=0)
    {
        super(x, y, z);
    }

    static dot(a, b)
    {
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

    copyFrom(vec3)
    {
        this.x = vec3.x;
        this.y = vec3.y;
        this.z = vec3.z;
    }

    addVec(vec3)
    {
        this.x += vec3.x;
        this.y += vec3.y;
        this.z += vec3.z;
    }

    subVec(vec3)
    {
        this.x -= vec3.x;
        this.y -= vec3.y;
        this.z -= vec3.z;
    }

    mulVec(vec3)
    {
        this.x *= vec3.x;
        this.y *= vec3.y;
        this.z *= vec3.z;
    }

    mulScalar(s)
    {
        this.x *= s;
        this.y *= s;
        this.z *= s;
    }

    cross(a, b)
    {
        this.setValues(
            a.y*b.z - a.z*b.y,
            a.z*b.x - a.x*b.z,
            a.x*b.y - a.y*b.x
        );
    }

    sqrDist(vec3)
    {
        return (this.x - vec3.x) ** 2 +
               (this.y - vec3.y) ** 2 +
               (this.z - vec3.z) ** 2;
    }

    sqrMag()
    {
        const {x, y, z} = this;

        return x*x + y*y + z*z;
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
}
