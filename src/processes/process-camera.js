import * as $ from "../const";
import { Space } from "../components/space";
import { Camera } from "../camera";
import { Scene } from "../scene";
import { Ground } from "../components/ground";

export const processCamera = () =>
{
    const focusedEntityId = Camera.getFocusEntityId();

    if (focusedEntityId)
    {
        const [space] = Scene.one(focusedEntityId, Space);
        Camera.setPosition(space.world.translation);
    }

    const ray = Camera.getRay();
    ray.fromMouse();
    ray.collideZeroPlane();

    if (ray.isHit)
    {
        const [space] = Scene.one($.ENT_PLAYER, Space);
        const [ground] = Scene.one($.ENT_GROUND, Ground);

        const isCollision = ground.isCollision(
            ray.hitPoint,
            space.world.translation
        );

        if (isCollision)
        {
            //
        }
    }
};
