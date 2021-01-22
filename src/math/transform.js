import { Quaternion } from "./quaternion";
import { Vector } from "./vector";

export class Transform
{
    constructor(tx, ty, tz)
    {
        this.translation = new Vector(tx, ty, tz);
        this.rotation = new Quaternion();
        this.scale = new Vector(1, 1, 1);
    }

    decomposeFrom(matrix)
    {
        const [
            M0, M1, M2, ,
            M4, M5, M6, ,
            M8, M9, MA, ,
            MC, MD, ME
        ] = matrix;

        /*----------------------------------------------------------------------
            Translation
        ----------------------------------------------------------------------*/
        this.translation.setValues(MC, MD, ME);

        /*----------------------------------------------------------------------
            Scale
        ----------------------------------------------------------------------*/
        const sx = (M0**2 + M1**2 + M2**2) ** 0.5;
        const sy = (M4**2 + M5**2 + M6**2) ** 0.5;
        const sz = (M8**2 + M9**2 + MA**2) ** 0.5;
        this.scale.setValues(sx, sy, sz);

        /*----------------------------------------------------------------------
            Rotation
            http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm
        ----------------------------------------------------------------------*/
        const R0 = M0 / sx;
        const R1 = M1 / sx;
        const R2 = M2 / sx;
        const R4 = M4 / sy;
        const R5 = M5 / sy;
        const R6 = M6 / sy;
        const R8 = M8 / sz;
        const R9 = M9 / sz;
        const RA = MA / sz;

        const trace = R0 + R5 + RA;

        let qx, qy, qz, qw;

        if (trace > 0)
        {
            const s = 0.5 / (trace + 1) ** 0.5;

            qx = (R6 - R9) * s;
            qy = (R8 - R2) * s;
            qz = (R1 - R4) * s;
            qw = 0.25 / s;
        }
        else if (R0 > R5 && R0 > RA)
        {
            const s = 2 * (1 + R0 - R5 - RA) ** 0.5;
            qx = 0.25 * s;
            qy = (R4 + R1) / s;
            qz = (R8 + R2) / s;
            qw = (R6 - R9) / s;
        }
        else if (R5 > RA)
        {
            const s = 2 * (1 + R5 - R0 - RA) ** 0.5;
            qx = (R4 + R1) / s;
            qy = 0.25 * s;
            qz = (R9 + R6) / s;
            qw = (R8 - R2) / s;
        }
        else
        {
            const s = 2 * (1 + RA - R0 - R5) ** 0.5;
            qx = (R8 + R2) / s;
            qy = (R9 + R6) / s;
            qz = 0.25 * s;
            qw = (R1 - R4) / s;
        }

        this.rotation.setValues(qx, qy, qz, qw);
    }
}
