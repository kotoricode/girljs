export class BufferData extends Float32Array
{
    constructor(...params)
    {
        super(...params);
    }

    from(array)
    {
        this.set(...array);
    }

    set(...values)
    {
        if (this.length !== values.length)
        {
            throw Error;
        }

        for (let i = 0; i < values.length; i++)
        {
            this[i] = values[i];
        }
    }
}

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

export class SettableArray extends Array
{
    constructor(...params)
    {
        super(...params);
    }

    from(array)
    {
        this.set(...array);
    }

    set(...values)
    {
        if (this.length !== values.length)
        {
            throw Error;
        }

        for (let i = 0; i < values.length; i++)
        {
            this[i] = values[i];
        }
    }
}