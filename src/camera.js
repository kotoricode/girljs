import * as $ from "./const";
import { Buffer } from "./gl/buffer";
import { SettableFloat32Array, DEG_TO_RAD } from "./utility";
import { Matrix } from "./math/matrix";
import { Transform } from "./math/transform";

export const Camera = {
    getFocusEntityId()
    {
        return focus;
    },
    getInvViewProjection()
    {
        return invViewProjection;
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

    viewProjectionData.from(viewProjection);

    Buffer.setData($.BUF_UNI_CAMERA, viewProjectionData);
};

let focus;

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

transform.rotation.fromEuler(-11.5, 0, 0);

const viewProjectionData = new SettableFloat32Array(16);

Camera.setFocusEntityId($.ENTITY_PLAYER);
updateViewProjection();
