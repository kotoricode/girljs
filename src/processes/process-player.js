import * as $ from "../const";
import { Mouse } from "../main";
import { Camera } from "../camera";
import { Motion } from "../components/motion";
import { Scene } from "../scene";
import { Drawable } from "../components/drawable";

export const processPlayer = () =>
{
    const [pMotion] = Scene.one($.ENT_PLAYER, Motion);
    const [wMotion, wDrawable] = Scene.one($.ENT_WAYPOINT, Motion, Drawable);

    if (Mouse.isClick())
    {
        Mouse.consume();
        const ray = Camera.getRay();

        if (ray.isHit)
        {
            pMotion.setMainTarget(ray.hitPoint);
            wMotion.setMainTarget(ray.hitPoint);
        }
    }

    wDrawable.isVisible = pMotion.hasTarget();
};
