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

        this.translation.setValues(MC, MD, ME);

        const sx = Math.sqrt(M0**2 + M1**2 + M2**2);
        const sy = Math.sqrt(M4**2 + M5**2 + M6**2);
        const sz = Math.sqrt(M8**2 + M9**2 + MA**2);

        this.scale.setValues(sx, sy, sz);

        this.rotation.fromMatrix(
            M0 / sx,
            M1 / sx,
            M2 / sx,

            M4 / sy,
            M5 / sy,
            M6 / sy,

            M8 / sz,
            M9 / sz,
            MA / sz,
        );

        // NORMALIZE
        this.scale.setValues(
            sx / (1 / this.rotation[3] ** 2),
            sy / (1 / this.rotation[3] ** 2),
            sz / (1 / this.rotation[3] ** 2),
        );

        this.rotation.setValues(
            this.rotation[0] / this.rotation[3],
            this.rotation[1] / this.rotation[3],
            this.rotation[2] / this.rotation[3],
            this.rotation[3] / this.rotation[3]
        );
    }
}
