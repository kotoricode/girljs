import * as $ from "./const";
import { BufferUniform } from "./gl/buffer";
import { BufferData, DEG_TO_RAD } from "./utility";
import { Matrix } from "./math/matrix";
import { Transform } from "./math/transform";

export const getInvViewProjection = () => invViewProjection;

export const getViewProjection = () => viewProjection;

export const setCameraPosition = (vec) =>
{
    transform.translation.x = vec.x;

    /*--------------------------------------------------------------------------
        ViewProjection & Inverted ViewProjection
    --------------------------------------------------------------------------*/
    viewProjection.composeFrom(transform);
    viewProjection.invert();
    viewProjection.multiply(projection);
    invViewProjection.invertFrom(viewProjection);

    /*--------------------------------------------------------------------------
        Update UBO
    --------------------------------------------------------------------------*/
    viewProjectionData.from(viewProjection);
    BufferUniform.data($.BUF_UNI_CAMERA, viewProjectionData);
};

const far = 600;
const near = 1;
const fov = 30;

const transform = new Transform(0, 2.7, 8);
const viewProjection = new Matrix();
const invViewProjection = new Matrix();

const tan = Math.tan(DEG_TO_RAD * fov / 2);
const dist = far - near;
const projection = new Matrix(
    1/($.SCREEN_ASPECT * tan), 0, 0, 0,
    0, 1/tan, 0, 0,
    0, 0, -(far+near) / dist, -1,
    0, 0, -2*far*near / dist, 0
);

transform.rotation.fromEuler(0.2, 0, 0);

const viewProjectionData = new BufferData(16);
