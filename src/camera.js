import { Transform } from "./components/transform";
import { Matrix4 } from "./math/matrix4";
import { Ray } from "./math/ray";

const halfHeight = 300;
const aspect = 16 / 9;
const nearPlane = 1;
const farPlane = 3;

const invFrustumLength = 1 / (farPlane - nearPlane);
const vpL5 = 1 / halfHeight;
const vpL0 = vpL5 / aspect;
const vpLA = -2 * invFrustumLength;
const vpLE = -(farPlane+nearPlane) * invFrustumLength;

const transform = new Transform(0, 0, 2);

const ray = new Ray(0, 0);
const viewProjection = new Matrix4();
const invViewProjection = new Matrix4();

export const getCameraTransform = () =>
{
    return transform;
};

export const getCameraRay = () =>
{
    return ray;
};

export const getViewProjection = () =>
{
    return viewProjection;
};

export const getInvViewProjection = () =>
{
    return invViewProjection;
};

export const setCameraPosition = (vec3) =>
{
    transform.local.translation.set(vec3.x, vec3.y);

    /*--------------------------------------------------------------------------
        ViewProjection & Inverted ViewProjection
    --------------------------------------------------------------------------*/
    viewProjection.fromTransform(transform.local);
    viewProjection.invertFrom(viewProjection);

    const [
        R0, R1, R2, R3,
        R4, R5, R6, R7,
        R8, R9, RA, RB,
        RC, RD, RE, RF
    ] = viewProjection;

    viewProjection.set(
        vpL0*R0,
        vpL5*R1,
        vpLA*R2 + vpLE*R3,
        R3,

        vpL0*R4,
        vpL5*R5,
        vpLA*R6 + vpLE*R7,
        R7,

        vpL0*R8,
        vpL5*R9,
        vpLA*RA + vpLE*RB,
        RB,

        vpL0*RC,
        vpL5*RD,
        vpLA*RE + vpLE*RF,
        RF
    );

    invViewProjection.invertFrom(viewProjection);
};
