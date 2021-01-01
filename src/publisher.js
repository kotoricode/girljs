export class Publisher
{
    constructor()
    {
        this.events = new Map();
    }

    subscribe(event, func, isInstant=true)
    {
        if (!this.events.has(event))
        {
            this.events.set(event, new Set());
        }

        this.events.get(event).add(func);

        if (isInstant)
        {
            func();
        }
    }

    emit(event)
    {
        if (this.events.has(event))
        {
            const funcs = this.events.get(event);

            for (const func of funcs)
            {
                func();
            }
        }
    }

    unsubscribe(event, func)
    {
        if (this.events.has(event))
        {
            const funcs = this.events.get(event);
            funcs.delete(func);
        }
    }
}
