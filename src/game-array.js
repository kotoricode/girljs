export class GameArray extends Array
{
    constructor(...values)
    {
        super(...values);
    }

    set(...values)
    {
        let i = values.length;

        while (i--)
        {
            this[i] = values[i];
        }
    }
}
