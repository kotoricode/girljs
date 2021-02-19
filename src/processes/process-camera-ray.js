import * as $ from "../const";
import { Camera } from "../camera";
import { Scene } from "../scene";
import { Ground } from "../components/ground";

export const processCameraRay = () =>
{
    const ray = Camera.getRay();
    ray.fromMouse();

    const [ground] = Scene.one($.ENT_GROUND, Ground);
    ray.collideGround(ground);
};
