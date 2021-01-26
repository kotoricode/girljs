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
            if (anim.isState($.ANI_IDLE))
            {
                anim.setState($.ANI_MOVE);
                const model = anim.getModel();
                drawable.program.setModel(model);
            }
        }
        else if (anim.isState($.ANI_MOVE))
        {
            anim.setState($.ANI_IDLE);
            const model = anim.getModel();
            drawable.program.setModel(model);
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
            drawable.program.setModel(model);
        }
    }
};
