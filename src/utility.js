export const LISTENER_ONCE = { once: true };

export const DEG_TO_RAD = Math.PI / 180;

export const HALF_PI = Math.PI / 2;

export const SIZEOF_FLOAT32 = 4;

export const SIZEOF_UINT16 = 2;

export const clamp = (value, min=0, max=1) => Math.max(
    min,
    Math.min(max, value)
);

export const getElement = (elemId) => window.document.getElementById(elemId);

export const hsvToRgb = (h, s, v, rgbArray) =>
{
    const h60 = h / 60;

    const c = s * v;
    const x = c * (1 - Math.abs(h60 % 2 - 1));

    let r, g, b;

    switch (h60 | 0)
    {
        case 0: r = c; g = x; b = 0; break;
        case 1: r = x; g = c; b = 0; break;
        case 2: r = 0; g = c; b = x; break;
        case 3: r = 0; g = x; b = c; break;
        case 4: r = x; g = 0; b = c; break;
        case 5: r = c; g = 0; b = x; break;
        default: throw h60;
    }

    const m = v - c;

    rgbArray[0] = r + m;
    rgbArray[1] = g + m;
    rgbArray[2] = b + m;
};

export const lerp = (start, end, amount) => start*(1-amount) + end*amount;

export const setArrayValues = (array, offset, ...values) =>
{
    const newOffset = values.length + offset;

    if (array.length < newOffset) throw values;

    for (let i = 0; i < values.length; i++)
    {
        array[offset + i] = values[i];
    }

    return newOffset;
};

export class SettableArray extends Array
{
    constructor(...params)
    {
        super(...params);
    }

    setValues(...values)
    {
        if (this.length !== values.length) throw values;

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
        if (!(subFunc instanceof Function)) throw subFunc;

        if (!eventSubs.has(event))
        {
            eventSubs.set(event, new Set());
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
            return JSON.parse(data);
        }
        catch
        {
            throw key;
        }
    },
    set(key, value)
    {
        const json = JSON.stringify(value);
        window.localStorage.setItem(key, json);
    }
};

const eventSubs = new Map();
