import * as $ from "../const";
import { Matrix4 } from "./matrix4";
import { Transform } from "./transform";

export const getInvViewProjection = () =>
{
    return invViewProjection;
};

export const getViewProjection = () =>
{
    return viewProjection;
};

export const setCameraPosition = (vec) =>
{
    transform.translation.set(vec.x, vec.y);

    /*--------------------------------------------------------------------------
        ViewProjection & Inverted ViewProjection
    --------------------------------------------------------------------------*/
    viewProjection.fromTransform(transform);
    viewProjection.invert();

    const [
        R0, R1, R2, R3,
        R4, R5, R6, R7,
        R8, R9, RA, RB,
        RC, RD, RE, RF
    ] = viewProjection;

    viewProjection.set(
        L0 * R0,
        L5 * R1,
        LA * R2 + LE * R3,
        R3,

        L0 * R4,
        L5 * R5,
        LA * R6 + LE * R7,
        R7,

        L0 * R8,
        L5 * R9,
        LA * RA + LE * RB,
        RB,

        L0 * RC,
        L5 * RD,
        LA * RE + LE * RF,
        RF
    );

    invViewProjection.invertFrom(viewProjection);
};

const f = 100;
const n = 1;
const dist = f - n;

const L0 = 2 / $.SCREEN_WIDTH,
      L5 = 2 / $.SCREEN_HEIGHT,
      LA = -2 / dist,
      LE = -(f + n) / dist;

const transform = new Transform(0, 0, 5),
      viewProjection = new Matrix4(),
      invViewProjection = new Matrix4();

transform.rotation.fromEuler(0, 0, 0.6);
