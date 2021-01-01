export class Publisher
{
    constructor()
    {
        this.events = {};
    }

    subscribe(event, func, isInstant=true)
    {
        if (!(event in this.events))
        {
            this.events[event] = new Set();
        }

        this.events[event].add(func);

        if (isInstant)
        {
            func();
        }
    }

    emit(event)
    {
        if (event in this.events)
        {
            const funcs = this.events[event];

            for (const func of funcs)
            {
                func();
            }
        }
    }

    unsubscribe(event, func)
    {
        if (event in this.events)
        {
            const funcs = this.events[event];
            funcs.delete(func);
        }
    }
}
