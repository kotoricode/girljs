import { SettableArray } from "./settable-array";

export class Quaternion extends SettableArray
{
    constructor()
    {
        super(0, 0, 0, 1);
    }

    fromEuler(x, y, z)
    {
        const hz = z / 2,
              hy = y / 2,
              hx = x / 2;

        const cz = Math.cos(hz),
              sz = Math.sin(hz),
              cy = Math.cos(hy),
              sy = Math.sin(hy),
              cx = Math.cos(hx),
              sx = Math.sin(hx);

        this.set(
            sx*cy*cz - cx*sy*sz,
            cx*sy*cz + sx*cy*sz,
            cx*cy*sz - sx*sy*cz,
            cx*cy*cz + sx*sy*sz
        );
    }
}
