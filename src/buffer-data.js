export class BufferData extends Float32Array
{
    constructor(param)
    {
        super(param);
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
}
