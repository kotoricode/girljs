export class SafeMap extends Map
{
    constructor(...params)
    {
        super(...params);
    }

    delete(key)
    {
        if (!super.delete(key))
        {
            throw key;
        }
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

export class SafeSet extends Set
{
    constructor(...params)
    {
        super(...params);
    }

    add(value)
    {
        if (this.has(value))
        {
            throw value;
        }

        return super.add(value);
    }

    delete(value)
    {
        if (!super.delete(value))
        {
            throw value;
        }
    }
}
