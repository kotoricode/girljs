import * as $ from "../const";
import { DEG_TO_RAD } from "./math-helper";
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
    transform.translation.set(vec.x);

    /*--------------------------------------------------------------------------
        ViewProjection & Inverted ViewProjection
    --------------------------------------------------------------------------*/
    viewProjection.fromTransform(transform);
    viewProjection.invert();

    viewProjection.multiply([
        1 / ($.SCREEN_ASPECT * fov),
        0,
        0,
        0,

        0,
        1 / fov,
        0,
        0,

        0,
        0,
        -(f + n) / dist,
        -1,

        0,
        0,
        -(2*f*n) / dist,
        0
    ]);

    invViewProjection.invertFrom(viewProjection);
};

const f = 1000;
const n = 1;
const dist = f - n;
const fov = Math.tan(DEG_TO_RAD * 30 / 2);

const transform = new Transform(0, 2.7, 8),
      viewProjection = new Matrix4(),
      invViewProjection = new Matrix4();

transform.rotation.fromEuler(0.2, 0, 0);
