const flagged = new Set();

export class Component
{
    constructor()
    {
        this.isRunning = true;

        const ctor = this.constructor;
        const ctorName = ctor.name;

        if (!flagged.has(ctorName))
        {
            ctor.flag = 1 << flagged.size;
            flagged.add(ctorName);
        }
    }
}
