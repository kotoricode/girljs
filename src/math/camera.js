import * as $ from "../const";
import { Matrix4 } from "./matrix4";
import { Transform } from "./transform";

// nearZ 1, farZ -1
const z = 2,
      nearDist = 1,
      farDist = 3;

const frustumLength = nearDist - farDist,
      vpL0 = 2 / $.SCREEN_WIDTH,
      vpL5 = vpL0 * $.SCREEN_ASPECT,
      vpLA = 2 / frustumLength,
      vpLE = (farDist+nearDist) / frustumLength;

const transform = new Transform(0, 0, z),
      viewProjection = new Matrix4(),
      invViewProjection = new Matrix4();

export const getViewProjection = () =>
{
    return viewProjection;
};

export const getInvViewProjection = () =>
{
    return invViewProjection;
};

export const setCameraPosition = (vec) =>
{
    transform.translation.set(vec.x, vec.y);

    /*--------------------------------------------------------------------------
        ViewProjection & Inverted ViewProjection
    --------------------------------------------------------------------------*/
    viewProjection.fromTransform(transform);
    viewProjection.invertFrom(viewProjection);

    const [
        R0, R1, R2, R3,
        R4, R5, R6, R7,
        R8, R9, RA, RB,
        RC, RD, RE, RF
    ] = viewProjection;

    viewProjection.set(
        vpL0*R0,
        vpL5*R1,
        vpLA*R2 + vpLE*R3,
        R3,

        vpL0*R4,
        vpL5*R5,
        vpLA*R6 + vpLE*R7,
        R7,

        vpL0*R8,
        vpL5*R9,
        vpLA*RA + vpLE*RB,
        RB,

        vpL0*RC,
        vpL5*RD,
        vpLA*RE + vpLE*RF,
        RF
    );

    invViewProjection.invertFrom(viewProjection);
};
