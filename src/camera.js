import * as $ from "./const";

import { Buffer } from "./gl/buffer";
import { DEG_TO_RAD, copyArray } from "./utility";
import { Matrix } from "./math/matrix";
import { Transform } from "./math/transform";
import { Ray } from "./math/ray";

export const Camera = {
    getFocusEntityId()
    {
        return focus;
    },
    getInvViewProjection()
    {
        return invViewProjection;
    },
    getRay()
    {
        return ray;
    },
    init()
    {
        updateViewProjection();
    },
    setFocusEntityId(entityId)
    {
        focus = entityId;
    },
    setPosition(vec)
    {
        if (transform.translation.x !== vec.x)
        {
            transform.translation.x = vec.x;
            updateViewProjection();
        }
    }
};

const updateViewProjection = () =>
{
    viewProjection.composeFrom(transform);
    viewProjection.invert();
    viewProjection.multiply(projection);
    invViewProjection.invertFrom(viewProjection);

    copyArray(viewProjection, viewProjectionData);

    Buffer.setDataBind($.BUF_UNI_CAMERA, viewProjectionData);
};

let focus;

const far = 600;
const near = 1;
const fov = 30;

const ray = new Ray(0, 0, 0, 0, 0, 1);

const transform = new Transform(0, 2.75, 6);
const viewProjection = new Matrix();
const invViewProjection = new Matrix();

const tan = Math.tan(DEG_TO_RAD * fov * 0.5);
const dist = far - near;

const projection = new Matrix(
    1/($.RES_ASPECT * tan), 0, 0, 0,
    0, 1/tan, 0, 0,
    0, 0, -(far+near) / dist, -1,
    0, 0, -2*far*near / dist, 0
);

transform.rotation.fromEuler(-11.5, 0, 0);

const viewProjectionData = new Float32Array(16);

Camera.setFocusEntityId($.ENT_PLAYER);
