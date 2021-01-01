const events = new Map();

export const publish = (event) =>
{
    if (events.has(event))
    {
        const funcs = events.get(event);

        for (const func of funcs)
        {
            func();
        }
    }
};

export const subscribe = (event, func, isInstant=true) =>
{
    if (!events.has(event))
    {
        events.set(event, new Set());
    }

    events.get(event).add(func);

    if (isInstant)
    {
        func();
    }
};
