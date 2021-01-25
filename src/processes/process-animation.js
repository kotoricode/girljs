import * as $ from "../const";
import { Motion } from "../components/motion";
import { Drawable } from "../components/drawable";
import { Anim } from "../components/anim";

export const processAnimation = (scene) =>
{
    for (const [drawable, anim, motion] of scene.all(Drawable, Anim, Motion))
    {
        if (motion.hasTarget())
        {
            if (anim.isState($.ANIM_IDLE))
            {
                anim.setState($.ANIM_MOVE);
                const model = anim.getModel();
                drawable.programData.setModel(model);
            }
        }
        else if (anim.isState($.ANIM_MOVE))
        {
            anim.setState($.ANIM_IDLE);
            const model = anim.getModel();
            drawable.programData.setModel(model);
        }
    }

    for (const [drawable, anim] of scene.all(Drawable, Anim))
    {
        anim.delay -= scene.dt;

        if (anim.delay <= 0)
        {
            const { delays, models } = anim;

            do
            {
                anim.frameIdx++;
                const nextDelay = delays[anim.frameIdx % delays.length];
                anim.delay += nextDelay;
            } while (anim.delay <= 0);

            anim.frameIdx %= models.length;
            const model = anim.getModel();
            drawable.programData.setModel(model);
        }
    }
};
