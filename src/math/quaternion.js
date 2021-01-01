import { GameArray } from "../game-array";

export class Quaternion extends GameArray
{
    constructor()
    {
        super(0, 0, 0, 1);
    }

    fromEuler(x, y, z)
    {
        const hz = z * 0.5,
              hy = y * 0.5,
              hx = x * 0.5;

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

        return this;
    }
}
