export class SettableArray extends Array
{
    constructor(...values)
    {
        super(...values);
    }

    from(array)
    {
        if (this.length !== array.length)
        {
            throw Error;
        }

        for (let i = 0; i < array.length; i++)
        {
            this[i] = array[i];
        }
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
