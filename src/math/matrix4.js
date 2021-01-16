// https://ncalculators.com/matrix/4x4-matrix-multiplication-calculator.htm
import * as $ from "../const";
import { SettableArray } from "../utils/better-builtins";

export class Matrix4 extends SettableArray
{
    constructor()
    {
        super(
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );
    }

    fromTransform(transform)
    {
        const [sx, sy, sz] = transform.scale;
        const [rx, ry, rz, rw] = transform.rotation;
        const [tx, ty, tz] = transform.translation;

        const rxx = rx * rx;
        const ryy = ry * ry;
        const rzz = rz * rz;
        const rww = rw * rw;
        const rxy = rx * ry;
        const rxz = rx * rz;
        const rxw = rx * rw;
        const ryz = ry * rz;
        const ryw = ry * rw;
        const rzw = rz * rw;

        this.setValues(
            sx * (rww + rxx - ryy - rzz),
            sx * (rxy - rzw) * 2,
            sx * (rxz + ryw) * 2,
            0,

            sy * (rxy + rzw) * 2,
            sy * (rww - rxx + ryy - rzz),
            sy * (ryz - rxw) * 2,
            0,

            sz * (rxz - ryw) * 2,
            sz * (ryz + rxw) * 2,
            sz * (rww - rxx - ryy + rzz),
            0,

            tx,
            ty,
            tz,
            1
        );
    }

    invert()
    {
        this.invertFrom(this);
    }

    invertFrom(matrix)
    {
        const [
            M0, M1, M2, M3,
            M4, M5, M6, M7,
            M8, M9, MA, MB,
            MC, MD, ME, MF
        ] = matrix;

        const M49 = M4 * M9;
        const M4A = M4 * MA;
        const M4B = M4 * MB;
        const M58 = M5 * M8;
        const M5A = M5 * MA;
        const M5B = M5 * MB;
        const M68 = M6 * M8;
        const M69 = M6 * M9;
        const M6B = M6 * MB;
        const M78 = M7 * M8;
        const M79 = M7 * M9;
        const M7A = M7 * MA;

        const A0 = M5A*MF + M6B*MD + M79*ME - M5B*ME - M69*MF - M7A*MD;
        const A1 = M4B*ME + M68*MF + M7A*MC - M4A*MF - M6B*MC - M78*ME;
        const A2 = M49*MF + M5B*MC + M78*MD - M4B*MD - M58*MF - M79*MC;
        const A3 = M4A*MD + M58*ME + M69*MC - M49*ME - M5A*MC - M68*MD;

        const id = 1 / (M0*A0 + M1*A1 + M2*A2 + M3*A3);

        const M0D = M0 * MD;
        const M0E = M0 * ME;
        const M0F = M0 * MF;
        const M1C = M1 * MC;
        const M1E = M1 * ME;
        const M1F = M1 * MF;
        const M2C = M2 * MC;
        const M2D = M2 * MD;
        const M2F = M2 * MF;
        const M3D = M3 * MD;
        const M3E = M3 * ME;
        const M3C = M3 * MC;

        this.setValues(
            id * A0,
            id * (M1E*MB + M2F*M9 + M3D*MA - M1F*MA - M2D*MB - M3E*M9),
            id * (M1F*M6 + M2D*M7 + M3E*M5 - M1E*M7 - M2F*M5 - M3D*M6),
            id * (M7A*M1 + M5B*M2 + M69*M3 - M6B*M1 - M79*M2 - M5A*M3),

            id * A1,
            id * (M0F*MA + M2C*MB + M3E*M8 - M0E*MB - M2F*M8 - M3C*MA),
            id * (M0E*M7 + M2F*M4 + M3C*M6 - M0F*M6 - M2C*M7 - M3E*M4),
            id * (M6B*M0 + M78*M2 + M4A*M3 - M7A*M0 - M4B*M2 - M68*M3),

            id * A2,
            id * (M0D*MB + M1F*M8 + M3C*M9 - M0F*M9 - M1C*MB - M3D*M8),
            id * (M0F*M5 + M1C*M7 + M3D*M4 - M0D*M7 - M1F*M4 - M3C*M5),
            id * (M79*M0 + M4B*M1 + M58*M3 - M5B*M0 - M78*M1 - M49*M3),

            id * A3,
            id * (M0E*M9 + M1C*MA + M2D*M8 - M0D*MA - M1E*M8 - M2C*M9),
            id * (M0D*M6 + M1E*M4 + M2C*M5 - M0E*M5 - M1C*M6 - M2D*M4),
            id * (M5A*M0 + M68*M1 + M49*M2 - M69*M0 - M4A*M1 - M58*M2)
        );
    }

    multiply(leftMatrix)
    {
        const [
            L0, L1, L2, L3,
            L4, L5, L6, L7,
            L8, L9, LA, LB,
            LC, LD, LE, LF
        ] = leftMatrix;

        const [
            R0, R1, R2, R3,
            R4, R5, R6, R7,
            R8, R9, RA, RB,
            RC, RD, RE, RF
        ] = this;

        this.setValues(
            L0*R0 + L4*R1 + L8*R2 + LC*R3,
            L1*R0 + L5*R1 + L9*R2 + LD*R3,
            L2*R0 + L6*R1 + LA*R2 + LE*R3,
            L3*R0 + L7*R1 + LB*R2 + LF*R3,
            L0*R4 + L4*R5 + L8*R6 + LC*R7,
            L1*R4 + L5*R5 + L9*R6 + LD*R7,
            L2*R4 + L6*R5 + LA*R6 + LE*R7,
            L3*R4 + L7*R5 + LB*R6 + LF*R7,
            L0*R8 + L4*R9 + L8*RA + LC*RB,
            L1*R8 + L5*R9 + L9*RA + LD*RB,
            L2*R8 + L6*R9 + LA*RA + LE*RB,
            L3*R8 + L7*R9 + LB*RA + LF*RB,
            L0*RC + L4*RD + L8*RE + LC*RF,
            L1*RC + L5*RD + L9*RE + LD*RF,
            L2*RC + L6*RD + LA*RE + LE*RF,
            L3*RC + L7*RD + LB*RE + LF*RF
        );
    }

    multiplyTransformMatrix(matrix)
    {
        const [
            L0, L1, L2, ,
            L4, L5, L6, ,
            L8, L9, LA, ,
            LC, LD, LE
        ] = matrix;

        const [
            R0, R1, R2, ,
            R4, R5, R6, ,
            R8, R9, RA, ,
            RC, RD, RE
        ] = this;

        this.setValues(
            L0*R0 + L4*R1 + L8*R2,
            L1*R0 + L5*R1 + L9*R2,
            L2*R0 + L6*R1 + LA*R2,
            0,

            L0*R4 + L4*R5 + L8*R6,
            L1*R4 + L5*R5 + L9*R6,
            L2*R4 + L6*R5 + LA*R6,
            0,

            L0*R8 + L4*R9 + L8*RA,
            L1*R8 + L5*R9 + L9*RA,
            L2*R8 + L6*R9 + LA*RA,
            0,

            L0*RC + L4*RD + L8*RE + LC,
            L1*RC + L5*RD + L9*RE + LD,
            L2*RC + L6*RD + LA*RE + LE,
            1
        );
    }

    multiplyPerspective(fov, near, far)
    {
        const dist = far - near;

        const L0 = 1 / ($.SCREEN_ASPECT * fov);
        const L5 = 1 / fov;
        const LA = -(far + near) / dist;
        const LE = -2*far*near / dist;

        const [
            R0, R1, R2, R3,
            R4, R5, R6, R7,
            R8, R9, RA, RB,
            RC, RD, RE, RF
        ] = this;

        this.setValues(
            L0*R0,
            L5*R1,
            LA*R2 + LE*R3,
            -R2,

            L0*R4,
            L5*R5,
            LA*R6 + LE*R7,
            -R6,

            L0*R8,
            L5*R9,
            LA*RA + LE*RB,
            -RA,

            L0*RC,
            L5*RD,
            LA*RE + LE*RF,
            -RE
        );
    }
}
