export class BufferData extends Float32Array
{
    constructor(...params)
    {
        super(...params);
    }

    from(array)
    {
        this.setValues(...array);
    }

    setValues(...values)
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
            throw Error;
        }
    }

    delete(key)
    {
        if (!super.delete(key))
        {
            throw Error;
        }
    }

    get(key)
    {
        this.assertHas(key);

        return super.get(key);
    }

    set(key, value)
    {
        if (this.has(key))
        {
            throw Error;
        }

        return super.set(key, value);
    }

    update(key, value)
    {
        this.assertHas(key);

        return super.set(key, value);
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
            throw Error;
        }

        return super.add(value);
    }

    delete(value)
    {
        if (!super.delete(value))
        {
            throw Error;
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
        this.setValues(...array);
    }

    setValues(...values)
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
