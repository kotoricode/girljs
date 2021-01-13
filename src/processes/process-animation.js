import * as $ from "../const";
import { Motion } from "../components/motion";
import { Space } from "../components/space";
import { Sprite } from "../components/sprite";
import { Vector } from "../math/vector";
import { SpriteAnimation } from "../components/sprite-animation";

export const processAnimation = (scene) =>
{
    for (const [sprite, animation] of scene.all(Sprite, SpriteAnimation))
    {
        animation.delay -= scene.dt;

        if (animation.delay <= 0)
        {
            const models = animation.stateModels.get($.ANIM_IDLE);

            animation.delay = animation.frameDelay;
            animation.frameIdx = (animation.frameIdx + 1) % models.length;
            sprite.setModel(models[animation.frameIdx]);
        }
    }
};
