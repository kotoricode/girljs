import * as $ from "../const";

import { Space } from "../components/space";
import { Camera } from "../camera";
import { Scene } from "../scene";
import { Ground } from "../components/ground";

export const processCamera = () =>
{
    const ray = Camera.getRay();
    ray.fromMouse();

    const [ground] = Scene.one($.ENT_GROUND, Ground);
    ray.collideGround(ground);

    const focusedEntityId = Camera.getFocusEntityId();

    if (focusedEntityId)
    {
        const [space] = Scene.one(focusedEntityId, Space);
        Camera.setPosition(space.world.translation);
    }
};
