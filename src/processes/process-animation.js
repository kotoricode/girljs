import * as $ from "../const";
import { Motion } from "../components/motion";
import { Space } from "../components/space";
import { Sprite } from "../components/sprite";
import { Vector } from "../math/vector";

export const processAnimation = (scene) =>
{
    for (const [motion, animation] of scene.all(Motion, Animation))
    {
        if (motion.hasTarget())
        {
            if (animation.isState($.ANIM_IDLE))
            {
                animation.setState($.ANIM_MOVE);
            }
        }
        else if (animation.isState($.ANIM_MOVE))
        {
            animation.setState($.ANIM_IDLE);
        }
    }

    for (const [animation] of animation)
    {
        animation.step(scene.dt);
    }
};
