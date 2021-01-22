import { SettableArray } from "../utility";

export class Quaternion extends SettableArray
{
    constructor()
    {
        super(0, 0, 0, 1);
    }

    // ZYX https://www.andre-gaschler.com/rotationconverter/
    // http://www.euclideanspace.com/maths/geometry/rotations/conversions/eulerToQuaternion/index.htm
    fromEuler(x, y, z)
    {
        const hx = x / 2;
        const hy = y / 2;
        const hz = z / 2;

        const sx = Math.sin(hx);
        const cx = Math.cos(hx);
        const sy = Math.sin(hy);
        const cy = Math.cos(hy);
        const sz = Math.sin(hz);
        const cz = Math.cos(hz);

        this.setValues(
            sx*cy*cz - cx*sy*sz,
            cx*sy*cz + sx*cy*sz,
            cx*cy*sz - sx*sy*cz,
            cx*cy*cz + sx*sy*sz
        );
    }
}
