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
    worldToClip(x, y, z)
    {
        const [
            L0, L1, L2, L3,
            L4, L5, L6, L7,
            L8, L9, LA, LB,
            LC, LD, LE, LF
        ] = viewProjection;

        const [
            , , , ,
            , , , ,
            , , , ,
            RC, RD, RE
        ] = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        ];

        const mat = new Matrix();

        mat.setValues(
            L0,
            L1,
            L2,
            L3,

            L4,
            L5,
            L6,
            L7,

            L8,
            L9,
            LA,
            LB,

            L0*RC + L4*RD + L8*RE + LC,
            L1*RC + L5*RD + L9*RE + LD,
            L2*RC + L6*RD + LA*RE + LE,
            L3*RC + L7*RD + LB*RE + LF
        );

        const w = L3*RC + L7*RD + LB*RE + LF;

        const b = [
            mat[12] / w,
            mat[13] / w,
            mat[14] / w
        ];

        b[0] = (b[0] + 1) / 2 * $.RES_WIDTH;
        b[1] = (1 - b[1]) / 2 * $.RES_HEIGHT;

        return b;
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

const tan = Math.tan(DEG_TO_RAD * fov * 0.5);
const dist = far - near;

const projection = new Matrix(
    1/($.RES_ASPECT * tan), 0, 0, 0,
    0, 1/tan, 0, 0,
    0, 0, -(far+near) / dist, -1,
    0, 0, -2*far*near / dist, 0
);

transform.rotation.euler(-11.5, 0, 0);

const viewProjectionData = new Float32Array(16);

Camera.setFocusEntityId($.ENT_PLAYER);
