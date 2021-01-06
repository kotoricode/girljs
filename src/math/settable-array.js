export class SettableArray extends Array
{
    constructor(...values)
    {
        super(...values);
    }

    set(...values)
    {
        if (this.length < values.length)
        {
            throw Error;
        }

        for (let i = 0; i < values.length; i++)
        {
            this[i] = values[i];
        }
    }
}
