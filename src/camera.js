import * as $ from "./const";

import { Buffer } from "./gl/buffer";
import { DEG_TO_RAD } from "./utility";
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
    },
    worldToScreen(x, y, z, vec)
    {
        const [
            L0, L1, , L3,
            L4, L5, , L7,
            L8, L9, , LB,
            LC, LD, , LF
        ] = viewProjection;

        const w = L3*x + L7*y + LB*z + LF;

        const clipX = (L0*x + L4*y + L8*z + LC) / w;
        const clipY = (L1*x + L5*y + L9*z + LD) / w;

        vec.setValues(
            (clipX + 1) / 2 * $.RES_WIDTH,
            (1 - clipY) / 2 * $.RES_HEIGHT,
            0
        );
    }
};

const updateViewProjection = () =>
{
    viewProjection.composeFrom(transform);
    viewProjection.invert();
    viewProjection.multiply(projection);
    invViewProjection.invertFrom(viewProjection);

    viewProjectionData.set(viewProjection);

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

const invTan = 1 / Math.tan(DEG_TO_RAD * fov * 0.5);
const dist = far - near;

const projection = new Matrix(
    invTan / $.RES_ASPECT, 0, 0, 0,
    0, invTan, 0, 0,
    0, 0, -(far+near) / dist, -1,
    0, 0, -2*far*near / dist, 0
);

transform.rotation.euler(-11.5, 0, 0);

const viewProjectionData = new Float32Array(16);

Camera.setFocusEntityId($.ENT_PLAYER);
