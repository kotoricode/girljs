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
            MC, MD, ME,
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

        let x, y, z, w;

        if (trace > 0)
        {
            const s = 0.5 / (trace + 1) ** 0.5;

            x = (R9 - R6) * s;
            y = (R2 - R8) * s;
            z = (R4 - R1) * s;
            w = 0.25 / s;
        }
        else if (R0 > R5 && R0 > RA)
        {
            const s = 2 * (1 + R0 - R5 - RA) ** 0.5;
            x = 0.25 * s;
            y = (R1 + R4) / s;
            z = (R2 + R8) / s;
            w = (R9 - R6) / s;
        }
        else if (R5 > RA)
        {
            const s = 2 * (1 + R5 - R0 - RA) ** 0.5;
            x = (R1 + R4) / s;
            y = 0.25 * s;
            z = (R6 + R9) / s;
            w = (R2 - R8) / s;
        }
        else
        {
            const s = 2 * (1 + RA - R0 - R5) ** 0.5;
            x = (R2 + R8) / s;
            y = (R6 + R9) / s;
            z = 0.25 * s;
            w = (R4 - R1) / s;
        }

        this.rotation.setValues(x, y, z, w);
    }
}
