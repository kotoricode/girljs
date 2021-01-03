import { mouse } from "../dom";
import { Camera } from "../components/camera";
import { Motion } from "../components/motion";
import { Transform } from "../components/transform";
import { Ground } from "../components/ground";

import * as $ from "../const";

export const processCamera = (scene) =>
{
    const [pMotion, pTransform] = scene.one(
        $.ENTITY_PLAYER, Motion, Transform
    );

    const pWorldTrans = pTransform.world.translation;

    const [cam, camTransform] = scene.one(
        $.ENTITY_CAMERA, Camera, Transform
    );

    const { viewProjection, ray } = cam;

    // Update camera position, matrix
    camTransform.local.translation.set(
        pWorldTrans.x,
        pWorldTrans.y
    );

    viewProjection.toViewProjection(cam, camTransform);
    cam.invViewProjection.invertFrom(viewProjection);

    // Update camera ray
    if (mouse.isClick)
    {
        const [ground] = scene.one($.ENTITY_GROUND, Ground);

        ray.numHits = 0;
        ray.fromMouse(cam.invViewProjection, mouse);
        ray.collide(ground);

        // Update player, marker paths
        if (ray.numHits)
        {
            const hit = ray.hit[0];
            pMotion.setMainTarget(hit);
        }
    }
};
