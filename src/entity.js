import { SafeMap, SafeSet } from "./utility";

export class Entity
{
    constructor(id, ...comps)
    {
        this.id = id;

        this.flags = 0;
        this.components = new SafeMap();
        this.childIds = new SafeSet();

        this.addComponent(...comps);
    }

    addComponent(...components)
    {
        for (const comp of components)
        {
            const ctor = comp.constructor;
            this.components.set(ctor, comp);
            this.flags |= ctor.flag;
        }
    }

    getComponent(cls)
    {
        return this.components.get(cls);
    }

    * getComponents(...classes)
    {
        for (const cls of classes)
        {
            yield this.getComponent(cls);
        }
    }

    hasComponent(cls)
    {
        return this.hasFlags(cls.flag);
    }

    hasFlags(flags)
    {
        if (!Number.isInteger(flags)) throw Error;

        return (flags & this.flags) === flags;
    }

    removeComponent(...components)
    {
        for (const comp of components)
        {
            const ctor = comp.constructor;
            this.components.delete(ctor);
            this.flags &= ~ctor.flag;
        }
    }
}
