export class Entity
{
    constructor(id, ...comps)
    {
        this.id = id;
        this.flags = 0;
        this.components = new Map();

        this.children = new Set();

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

            if (this.components.has(ctor))
            {
                throw Error;
            }

            this.components.set(ctor, comp);
            this.flags |= ctor.flag;
        }
    }

    getComponent(cls)
    {
        if (this.components.has(cls))
        {
            return this.components.get(cls);
        }

        throw Error;
    }

    hasFlags(flags)
    {
        return (flags & this.flags) === flags;
    }

    removeComponent(...components)
    {
        for (const comp of components)
        {
            const ctor = comp.constructor;

            if (!this.components.has(ctor))
            {
                throw Error();
            }

            this.components.delete(ctor);
            this.flags &= ~ctor.flag;
        }
    }
}
