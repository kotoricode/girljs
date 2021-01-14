export class MapDebug extends Map
{
    constructor(...params)
    {
        super(...params);
    }

    delete(key)
    {
        if (!this.has(key))
        {
            throw key;
        }

        return super.delete(key);
    }

    get(key)
    {
        if (!this.has(key))
        {
            throw key;
        }

        return super.get(key);
    }
}
