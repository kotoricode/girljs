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

    viewProjection.multiply([
        1 / ($.SCREEN_ASPECT * Math.tan(fov/2)),
        0,
        0,
        0,

        0,
        1 / (Math.tan(fov/2)),
        0,
        0,

        0,
        0,
        -(f + n)/(f - n),
        -1,

        0,
        0,
        -(2*f*n)/(f-n),
        0
    ]);

    invViewProjection.invertFrom(viewProjection);
};

const f = 1000;
const n = 1;
const fov = 1;

const transform = new Transform(0, 0, 500),
      viewProjection = new Matrix4(),
      invViewProjection = new Matrix4();

transform.rotation.fromEuler(0, 0, 0);
