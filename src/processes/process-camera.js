import { mouse } from "../dom";
import { Motion } from "../components/motion";
import { Transform } from "../components/transform";
import { Ground } from "../components/ground";

import * as $ from "../const";
import {
    getCameraRay, getInvViewProjection, setCameraPosition
} from "../camera";

export const processCamera = (scene) =>
{
    const [pMotion, plXform] = scene.one($.ENTITY_PLAYER, Motion, Transform);

    // Update camera position, matrix
    setCameraPosition(plXform.world.translation);

    // Update camera ray
    if (mouse.isClick)
    {
        const [ground] = scene.one($.ENTITY_GROUND, Ground);
        const ray = getCameraRay();

        ray.numHits = 0;
        const ivp = getInvViewProjection();

        ray.position.copyFrom(mouse.clip);
        ray.position.toWorld(ivp);
        ray.collide(ground);

        // Update player, marker paths
        if (ray.numHits)
        {
            const hit = ray.hit[0];
            pMotion.setMainTarget(hit);
        }
    }
};
