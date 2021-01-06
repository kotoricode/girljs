import { SettableArray } from "../settable-array";

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
