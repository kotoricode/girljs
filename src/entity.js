import { SafeMap, SafeSet } from "./utils/better-builtins";

export class Entity
{
    constructor(id, ...comps)
    {
        this.id = id;
        this.flags = 0;
        this.components = new SafeMap();
        this.children = new SafeSet();

        this.addComponent(...comps);
    }

    addChild(entity)
    {
        this.children.add(entity);
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

    hasFlags(flags)
    {
        if (Number.isInteger(flags))
        {
            return (flags & this.flags) === flags;
        }

        throw Error;
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
