import * as $ from "../const";
import { Mouse } from "../dom";
import { Camera } from "../camera";
import { HitBox } from "../components/hitbox";
import { Dialogue } from "../dialogue";
import { Motion } from "../components/motion";
import { Scene } from "../scene";

export const processPlayer = () =>
{
    if (Mouse.isClick())
    {
        Mouse.consumeClick();

        // Dialogue.setText(
        //     "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
        // );

        const ray = Camera.getRay();

        if (ray.isHit)
        {
            const [plMotion] = Scene.one($.ENT_PLAYER, Motion);
            plMotion.setMainTarget(ray.hitPoint);
        }
    }
};
