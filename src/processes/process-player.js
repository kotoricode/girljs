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

        //const [ground] = Scene.one($.ENT_GROUND, HitBox);

        const ray = Camera.getRay();

        ray.resetHits();
        ray.fromMouse();
        ray.collideZeroPlane();
        //ray.collide(ground);

        if (ray.hasHits())
        {
            const [plMotion] = Scene.one($.ENT_PLAYER, Motion);

            const hit = ray.hits[0];
            plMotion.setMainTarget(hit);
        }
    }
};
