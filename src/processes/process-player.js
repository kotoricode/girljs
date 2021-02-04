import * as $ from "../const";
import { Mouse } from "../dom";
import { Camera } from "../camera";
import { HitBox } from "../components/hitbox";
import { Ray } from "../math/ray";
import { Dialogue } from "../dialogue";
import { Motion } from "../components/motion";
import { Scene } from "../scene";

export const processPlayer = () =>
{
    if (Mouse.isClick)
    {
        Mouse.consumeClick();

        // Dialogue.setText(
        //     "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
        // );

        //const [ground] = Scene.one($.ENT_GROUND, HitBox);
        const ivp = Camera.getInvViewProjection();

        const ray = Camera.getRay();

        ray.numHits = 0;
        ray.fromMouse(ivp, Mouse.clip);
        ray.collideZeroPlane();
        //ray.collide(ground);

        if (ray.numHits)
        {
            const [plMotion] = Scene.one($.ENT_PLAYER, Motion);

            const hit = ray.hit[0];
            plMotion.setMainTarget(hit);
        }
    }
};
