import * as $ from "../const";
import { Mouse } from "../main";
import { Camera } from "../camera";
import { Motion } from "../components/motion";
import { Scene } from "../scene";

export const processPlayer = () =>
{
    if (Mouse.isClicked())
    {
        Mouse.consumeClick();

        const ray = Camera.getRay();

        if (ray.isHit)
        {
            const [plMotion] = Scene.one($.ENT_PLAYER, Motion);
            plMotion.setMainTarget(ray.hitPoint);
        }
    }
};
