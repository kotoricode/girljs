import { mouse } from "../dom";
import { Camera } from "../components/camera";
import { Motion } from "../components/motion";
import { Transform } from "../components/transform";
import { Ground } from "../components/ground";

import * as CONST from "../const";

export const processCamera = (scene) =>
{
    const [plMotion, plTransform] = scene.one(
        CONST.ENTITY_PLAYER, Motion, Transform
    );

    const [cam, camTransform] = scene.one(
        CONST.ENTITY_CAMERA, Camera, Transform
    );

    // Update camera position, matrix
    camTransform.local.translation.x = plTransform.world.translation.x;

    cam.viewProjection.toViewProjection(cam, camTransform);
    cam.invViewProjection.invertFrom(cam.viewProjection);

    // Update camera ray
    if (mouse.isClick)
    {
        const [ground] = scene.one(CONST.ENTITY_GROUND, Ground);

        cam.ray.numHits = 0;
        cam.ray.fromMouse(cam.invViewProjection, mouse.clipCoords);
        cam.ray.collide(ground);

        // Update player, marker paths
        if (cam.ray.numHits)
        {
            const hit = cam.ray.hit[0];
            plMotion.setMainTarget(hit);
        }
    }
};
