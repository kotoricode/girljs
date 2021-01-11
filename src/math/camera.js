import * as $ from "../const";
import { setUniformBuffer } from "../gl/buffer";
import { BufferData } from "./buffer-data";
import { DEG_TO_RAD } from "./math-helper";
import { Matrix4 } from "./matrix4";
import { Transform } from "./transform";

export const getInvViewProjection = () => invViewProjection;

export const getViewProjection = () => viewProjection;

export const setCameraPosition = (vec) =>
{
    transform.translation.set(vec.x);

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
    setUniformBuffer($.BUF_UNI_CAMERA, viewProjectionData);
};

const far = 1000;
const near = 1;
const fov = Math.tan(DEG_TO_RAD * 30 / 2);

const transform = new Transform(0, 2.7, 8);
const viewProjection = new Matrix4();
const invViewProjection = new Matrix4();

transform.rotation.fromEuler(0.2, 0, 0);

const viewProjectionData = new BufferData(16);
