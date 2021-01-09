import { SettableArray } from "./settable-array";

export class VectorBase extends SettableArray
{
    constructor(x, y)
    {
        super(x, y);
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
