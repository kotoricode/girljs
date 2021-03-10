import * as $ from "../const";
import { Mouse } from "../main";
import { Camera } from "../camera";
import { Motion } from "../components/motion";
import { Scene } from "../scene";

export const processPlayer = () =>
{
    if (Mouse.isClick())
    {
        Mouse.consume();

        const ray = Camera.getRay();

        if (ray.isHit)
        {
            const [playerMotion] = Scene.one($.ENT_PLAYER, Motion);
            const [wayMotion] = Scene.one($.ENT_WAYPOINT, Motion);
            playerMotion.setMainTarget(ray.hitPoint);
            wayMotion.setMainTarget(ray.hitPoint);
        }
    }
};
