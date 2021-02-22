import { DEG_TO_RAD, SettableArray } from "../utility";

export class Quaternion extends SettableArray
{
    constructor()
    {
        super(0, 0, 0, 1);
    }

    // ZYX
    // https://www.andre-gaschler.com/rotationconverter/
    // http://www.euclideanspace.com/maths/geometry/rotations/conversions/eulerToQuaternion/index.htm
    // https://quaternions.online/
    euler(x, y, z)
    {
        const hx = DEG_TO_RAD * x * 0.5;
        const hy = DEG_TO_RAD * y * 0.5;
        const hz = DEG_TO_RAD * z * 0.5;

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
