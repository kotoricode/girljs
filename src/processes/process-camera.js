import * as $ from "../const";
import { Mouse } from "../dom";
import { Motion } from "../components/motion";
import { Space } from "../components/space";
import { getInvViewProjection, setCameraPosition } from "../camera";
import { Ground } from "../components/ground";
import { Ray } from "../math/ray";

export const processCamera = (scene) =>
{
    const [plMotion, plSpace] = scene.one($.ENTITY_PLAYER, Motion, Space);
    setCameraPosition(plSpace.world.translation);

    if (Mouse.isWorldClick)
    {
        const [ground] = scene.one($.ENTITY_GROUND, Ground);
        const ivp = getInvViewProjection();

        ray.numHits = 0;
        ray.fromMouse(ivp, Mouse.clip);
        ray.collideGround(ground);

        // Update player, marker paths
        if (ray.numHits)
        {
            const hit = ray.hit[0];
            plMotion.setMainTarget(hit);
        }
    }
};

const ray = new Ray(0, 0, 0, 0, 0, 1);
