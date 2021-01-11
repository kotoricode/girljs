import * as $ from "../const";
import { gl } from "../dom";
import {
    bindUniformBuffer, getBuffer, unbindUniformBuffer, setUniformBufferData, bindBufferBase
} from "../gl/gl-helper";
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

    /*--------------------------------------------------------------------------
        Update UBO
    --------------------------------------------------------------------------*/
    vpData.set(viewProjection);

    bindUniformBuffer($.BUFFER_UNIFORM_CAMERA);
    setUniformBufferData($.BUFFER_UNIFORM_CAMERA, vpData);
    unbindUniformBuffer();
};

export const cameraBindUniformBlock = (program) =>
{
    const ubIdx = gl.getUniformBlockIndex(program, $.UB_CAMERA);
    gl.uniformBlockBinding(program, ubIdx, vpIndex);
};

const f = 1000;
const n = 1;
const dist = f - n;
const fov = Math.tan(DEG_TO_RAD * 30 / 2);

const transform = new Transform(0, 2.7, 8);
const viewProjection = new Matrix4();
const invViewProjection = new Matrix4();

transform.rotation.fromEuler(0.2, 0, 0);

const vpData = new Float32Array(16);
const vpIndex = 0;

bindBufferBase($.BUFFER_UNIFORM_CAMERA, vpIndex);
