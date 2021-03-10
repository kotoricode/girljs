import { Component } from "./components/component";

export class Entity extends Map
{
    constructor(id)
    {
        super();
        this.id = id;
        this.flags = 0;
        Object.seal(this);
    }

    set(...components)
    {
        for (const comp of components)
        {
            if (!(comp instanceof Component)) throw Error;

            const ctor = comp.constructor;
            super.set(ctor, comp);
            this.flags |= ctor.flag;
        }
    }

    hasFlags(flags)
    {
        if (!Number.isInteger(flags)) throw flags;

        return (flags & this.flags) === flags;
    }

    delete(...components)
    {
        for (const comp of components)
        {
            const ctor = comp.constructor;
            super.delete(ctor);
            this.flags &= ~ctor.flag;
        }
    }
}
