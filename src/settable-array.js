export class SettableArray extends Array
{
    constructor(...values)
    {
        super(...values);
    }

    set(...values)
    {
        for (let i = 0; i < values.length; i++)
        {
            this[i] = values[i];
        }
    }
}
