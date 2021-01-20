import * as $ from "./const";
import { BufferUniform } from "./gl/buffer";
import { DEG_TO_RAD, BufferData } from "./utility";
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
    viewProjection.fromTransform(transform);
    viewProjection.invert();
    viewProjection.multiplyPerspective(fov, near, far);
    invViewProjection.invertFrom(viewProjection);

    /*--------------------------------------------------------------------------
        Update UBO
    --------------------------------------------------------------------------*/
    viewProjectionData.from(viewProjection);
    BufferUniform.data($.BUF_UNI_CAMERA, viewProjectionData);
};

const far = 600;
const near = 1;
const fov = Math.tan(DEG_TO_RAD * 30 / 2);

const transform = new Transform(0, 2.7, 8);
const viewProjection = new Matrix();
const invViewProjection = new Matrix();

transform.rotation.fromEuler(0.2, 0, 0);

const viewProjectionData = new BufferData(16);
