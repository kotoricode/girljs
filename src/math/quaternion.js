import { SettableArray } from "../utility";

export class Quaternion extends SettableArray
{
    constructor()
    {
        super(0, 0, 0, 1);
    }

    // ZYX
    // https://www.andre-gaschler.com/rotationconverter/
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

    // http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
    //fromMatrix(M0, M1, M2, M4, M5, M6, M8, M9, MA)
    fromMatrix(M0, M4, M8, M1, M5, M9, M2, M6, MA)
    {
        const trace = M0 + M5 + MA;

        let x, y, z, w;

        if (trace > 0)
        {
            const s = 0.5 / Math.sqrt(trace + 1);

            x = (M6 - M9) * s;
            y = (M8 - M2) * s;
            z = (M1 - M4) * s;
            w = 0.25 / s;
        }
        else if (M0 > M5 && M0 > MA)
        {
            const s = 2 * Math.sqrt(1 + M0 - M5 - MA);
            x = 0.25 * s;
            y = (M4 + M1) / s;
            z = (M8 + M2) / s;
            w = (M6 - M9) / s;
        }
        else if (M5 > MA)
        {
            const s = 2 * Math.sqrt(1 + M5 - M0 - MA);
            x = (M4 + M1) / s;
            y = 0.25 * s;
            z = (M9 + M6) / s;
            w = (M8 - M2) / s;
        }
        else
        {
            const s = 2 * Math.sqrt(1 + MA - M0 - M5);
            x = (M8 + M2) / s;
            y = (M9 + M6) / s;
            z = 0.25 * s;
            w = (M1 - M4) / s;
        }

        this.setValues(x, y, z, w);
    }
}

// const a = new Quaternion();
// a.fromMatrix([
//     0.879923176281257, -0.3275796727282261, 0.3441318960200753, 0,
//     0.3720255519422595, 0.9255641594466818, -0.07019954023933847, 0,
//     -0.2955202066613395, 0.18979606097868743, 0.9362933635841991, 0,
//     0, 0, 0, 1
// ]);

// console.log(a);
