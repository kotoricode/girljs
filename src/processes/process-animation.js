import * as $ from "../const";
import { Motion } from "../components/motion";
import { Drawable } from "../components/drawable";
import { Anim } from "../components/anim";
import { Scene } from "../scene";

export const processAnimation = () =>
{
    /*--------------------------------------------------------------------------
        Update state IDLE/MOVE based on motion
    --------------------------------------------------------------------------*/
    for (const [drawable, anim, motion] of Scene.all(Drawable, Anim, Motion))
    {
        if (motion.hasTarget())
        {
            if (anim.isState($.ANI_IDLE))
            {
                anim.setState($.ANI_MOVE);
                setModelFromAnim(anim, drawable);
            }
        }
        else if (anim.isState($.ANI_MOVE))
        {
            anim.setState($.ANI_IDLE);
            setModelFromAnim(anim, drawable);
        }
    }

    /*--------------------------------------------------------------------------
        Update frame of current animation
    --------------------------------------------------------------------------*/
    const dt = Scene.getDeltaTime();

    for (const [drawable, anim] of Scene.all(Drawable, Anim))
    {
        anim.delay -= dt;

        if (anim.delay <= 0)
        {
            const { delays, modelIds } = anim;

            do
            {
                anim.delay += delays[++anim.frameIndex % delays.length];
            }
            while (anim.delay <= 0);

            anim.frameIndex %= modelIds.length;
            setModelFromAnim(anim, drawable);
        }
    }
};

const setModelFromAnim = (anim, drawable) =>
{
    const modelId = anim.getModelId();
    drawable.program.setModel(modelId);
};
