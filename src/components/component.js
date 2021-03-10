const flagged = new Set();

export class Component
{
    constructor()
    {
        const ctor = this.constructor;
        const ctorName = ctor.name;

        if (!flagged.has(ctorName))
        {
            if (flagged.size > 31) throw flagged;

            ctor.flag = 1 << flagged.size;
            flagged.add(ctorName);
        }
    }
}
