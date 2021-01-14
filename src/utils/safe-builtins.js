export class SafeMap extends Map
{
    constructor(...params)
    {
        super(...params);
    }

    assertHas(key)
    {
        if (!this.has(key))
        {
            throw key;
        }
    }

    assertHasNot(key)
    {
        if (this.has(key))
        {
            throw key;
        }
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
        this.assertHas(key);

        return super.get(key);
    }
}

export class SafeSet extends Set
{
    constructor(...params)
    {
        super(...params);
    }

    assertHas(key)
    {
        if (!this.has(key))
        {
            throw key;
        }
    }

    assertHasNot(key)
    {
        if (this.has(key))
        {
            throw key;
        }
    }

    add(value)
    {
        this.assertHasNot(value);

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
