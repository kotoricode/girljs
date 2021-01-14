import { MapDebug } from "./map-debug";

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
        if (!(subFunc instanceof Function))
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
    },
    unsubscribe(event, subFunc)
    {
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
    }
};

const eventSubs = new MapDebug();
