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
            const { delays, models } = animation;

            do
            {
                animation.frameIdx++;
                const nextDelay = delays[animation.frameIdx % delays.length];
                animation.delay += nextDelay;
            } while (animation.delay <= 0);

            animation.frameIdx %= models.length;
            const model = models[animation.frameIdx];
            sprite.setModel(model);
        }
    }
};
