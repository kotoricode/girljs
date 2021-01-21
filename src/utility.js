export const LISTENER_ONCE = { once: true };

export const clamp = (val, min=0, max=1) => Math.min(max, Math.max(min, val));

export const lerp = (start, end, amount) => start*(1-amount) + end*amount;

export const DEG_TO_RAD = Math.PI / 180;

export const getElement = (elemId) => window.document.getElementById(elemId);

export const isString = (value) => typeof value === "string";

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
        if (this.length !== values.length) throw Error;

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

    delete(key)
    {
        if (key === undefined || key === null) throw Error;
        if (!super.delete(key)) throw Error;
    }

    get(key)
    {
        if (key === undefined || key === null) throw Error;
        if (!this.has(key)) throw Error;

        return super.get(key);
    }

    set(key, value)
    {
        if (key === undefined || key === null) throw Error;
        if (value === undefined || value === null) throw Error;
        if (this.has(key)) throw Error;

        return super.set(key, value);
    }

    update(key, value)
    {
        if (key === undefined || key === null) throw Error;
        if (value === undefined || value === null) throw Error;
        if (!this.has(key)) throw Error;

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
        if (value === undefined || value === null) throw Error;
        if (this.has(value)) throw Error;

        return super.add(value);
    }

    delete(value)
    {
        if (value === undefined || value === null) throw Error;
        if (!super.delete(value)) throw Error;
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
        if (this.length !== values.length) throw Error;

        for (let i = 0; i < values.length; i++)
        {
            this[i] = values[i];
        }
    }
}

export const Publisher = {
    publish(event)
    {
        if (eventSubs.has(event))
        {
            const subs = eventSubs.get(event);

            for (const func of subs)
            {
                func();
            }
        }
    },
    subscribe(event, subFunc)
    {
        if (!(subFunc instanceof Function)) throw Error;

        if (!eventSubs.has(event))
        {
            eventSubs.set(event, new SafeSet());
        }

        const subs = eventSubs.get(event);
        subs.add(subFunc);
    },
    unsubscribe(event, subFunc)
    {
        const subs = eventSubs.get(event);
        subs.delete(subFunc);

        if (!subs.size)
        {
            eventSubs.delete(subs);
        }
    }
};

export const Storage = {
    get(key)
    {
        const data = window.localStorage.getItem(key);

        try
        {
            const parsed = JSON.parse(data);

            return parsed;
        }
        catch
        {
            throw Error;
        }
    },
    set(key, value)
    {
        const json = JSON.stringify(value);
        window.localStorage.setItem(key, json);
    }
};

const eventSubs = new SafeMap();
