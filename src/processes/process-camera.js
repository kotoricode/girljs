import * as $ from "../const";
import { mouse } from "../dom";
import { Motion } from "../components/motion";
import { Space } from "../components/space";
import { getInvViewProjection, setCameraPosition } from "../math/camera";
import { Vector2 } from "../math/vector2";
import { Ground } from "../components/ground";
import { Ray } from "../math/ray";
import { Vector3 } from "../math/vector3";

export const processCamera = (scene) =>
{
    const [pMotion, plSpace] = scene.one($.ENTITY_PLAYER, Motion, Space);
    setCameraPosition(plSpace.world.translation);

    if (mouse.isWorldClick)
    {
        const [ground] = scene.one($.ENTITY_GROUND, Ground);

        const ivp = getInvViewProjection();

        ray.numHits = 0;
        ray.fromMouse(ivp, mouse.clip);
        ray.collide(ground);

        // Update player, marker paths
        if (ray.numHits)
        {
            console.log("collide");
            // const hit = cam.ray.hit[0];
            // plMotion.setMainTarget(hit);
        }

        // position.copyFrom(mouse.clip);
        // position.toWorld();

        // coll.hasPoint(position);

        // if (coll.hasPoint(position))
        // {
        //     pMotion.setMainTarget(position);
        // }
    }
};

const position = new Vector2();
const ray = new Ray(
    new Vector3(),
    new Vector3(0, 0, 1)
);
