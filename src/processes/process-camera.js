import { mouse } from "../dom";
import { Motion } from "../components/motion";
import { Space } from "../components/space";

import * as $ from "../utils/const";
import { getInvViewProjection, setCameraPosition } from "../math/camera";
import { Vector2 } from "../math/vector2";
import { Collider } from "../components/collider";

const position = new Vector2();


export const processCamera = (scene) =>
{
    const [pMotion, plSpace] = scene.one($.ENTITY_PLAYER, Motion, Space);

    // Update camera position, matrix
    const { x, y } = plSpace.world.translation;
    setCameraPosition(x, y);

    // Update camera ray
    if (mouse.isClick)
    {
        const [coll] = scene.one($.ENTITY_GROUND, Collider);

        const ivp = getInvViewProjection();

        position.copyFrom(mouse.clip);
        position.toWorld(ivp);
        coll.hasPoint(position);

        // Update player path
        if (coll.hasPoint(position))
        {
            pMotion.setMainTarget(position);
        }
    }
};
