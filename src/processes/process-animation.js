import * as $ from "../const";
import { Motion } from "../components/motion";
import { Drawable } from "../components/drawable";
import { Anim } from "../components/anim";
import { Scene } from "../scene";

export const processAnimation = (dt) =>
{
    for (const [drawable, anim, motion] of Scene.all(Drawable, Anim, Motion))
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

    for (const [drawable, anim] of Scene.all(Drawable, Anim))
    {
        anim.delay -= dt;

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
