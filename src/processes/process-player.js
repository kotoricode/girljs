import * as $ from "../const";
import { Mouse } from "../dom";
import { Camera } from "../camera";
import { Dialogue } from "../dialogue";
import { Motion } from "../components/motion";
import { Scene } from "../scene";

export const processPlayer = () =>
{
    if (Mouse.isClicked())
    {
        Mouse.consumeClick();
        Dialogue.setText(
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        );

        const ray = Camera.getRay();

        if (ray.isHit)
        {
            const [plMotion] = Scene.one($.ENT_PLAYER, Motion);
            plMotion.setMainTarget(ray.hitPoint);
        }
    }
};
