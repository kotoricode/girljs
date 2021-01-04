const eventSubs = new Map();

export const publish = (event) =>
{
    if (eventSubs.has(event))
    {
        const subs = eventSubs.get(event);

        for (const func of subs)
        {
            func();
        }
    }
};

export const subscribe = (event, subFunc) =>
{
    if (typeof subFunc !== "function")
    {
        throw Error;
    }

    if (!eventSubs.has(event))
    {
        eventSubs.set(event, new Set());
    }

    const subs = eventSubs.get(event);

    if (subs.has(subFunc))
    {
        throw Error;
    }

    subs.add(subFunc);
};

export const unsubscribe = (event, subFunc) =>
{
    if (!eventSubs.has(event))
    {
        throw Error;
    }

    const subs = eventSubs.get(event);

    if (!subs.has(subFunc))
    {
        throw Error;
    }

    subs.delete(subFunc);

    if (!subs.size)
    {
        eventSubs.delete(subs);
    }
};
