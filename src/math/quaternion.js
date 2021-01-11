import { SettableArray } from "./settable-array";

export class Quaternion extends SettableArray
{
    constructor()
    {
        super(0, 0, 0, 1);
    }

    fromEuler(x, y, z)
    {
        const hz = z / 2;
        const hy = y / 2;
        const hx = x / 2;

        const cz = Math.cos(hz);
        const sz = Math.sin(hz);
        const cy = Math.cos(hy);
        const sy = Math.sin(hy);
        const cx = Math.cos(hx);
        const sx = Math.sin(hx);

        this.set(
            sx*cy*cz - cx*sy*sz,
            cx*sy*cz + sx*cy*sz,
            cx*cy*sz - sx*sy*cz,
            cx*cy*cz + sx*sy*sz
        );
    }
}
