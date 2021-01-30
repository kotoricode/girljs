import * as $ from "../const";
import { Mouse } from "../dom";
import { Camera } from "../camera";
import { Ground } from "../components/ground";
import { Ray } from "../math/ray";
import { Dialogue } from "../dialogue";
import { Motion } from "../components/motion";
import { Scene } from "../scene";

export const processPlayer = () =>
{
    if (Mouse.isWorldClick)
    {
        // Dialogue.setText(
        //     "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
        // );

        const [ground] = Scene.one($.ENT_GROUND, Ground);
        const ivp = Camera.getInvViewProjection();

        ray.numHits = 0;
        ray.fromMouse(ivp, Mouse.clip);
        console.log(ray.collideAABB());
        ray.collideGround(ground);

        // Update player, marker paths
        if (ray.numHits)
        {
            const [plMotion] = Scene.one($.ENT_PLAYER, Motion);

            const hit = ray.hit[0];
            plMotion.setMainTarget(hit);
        }
    }
};

const ray = new Ray(0, 0, 0, 0, 0, 1);
