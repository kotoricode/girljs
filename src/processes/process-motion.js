import { Motion } from "../components/motion";
import { Space } from "../components/space";
import { Vector2 } from "../math/vector2";

const dist = new Vector2();

export const processMotion = (scene) =>
{
    for (const [motion, space] of scene.all(Motion, Space))
    {
        if (space.isDirty)
        {
            throw space;
        }

        if (motion.hasTarget())
        {
            const { local, world } = space;

            const target = motion.getTarget();
            dist.copyFrom(target);
            dist.subVec(world.translation);

            if (dist.x)
            {
                local.scale.x = Math.sign(dist.x);
            }

            const step = motion.speed * scene.dt;

            if (step**2 < dist.sqrMag())
            {
                dist.normalize(step);
            }
            else
            {
                motion.idx++;

                if (motion.idx > motion.maxIdx)
                {
                    motion.resetTargets();
                }
            }

            local.translation.addVec(dist);

            scene.markDirty(space);
        }
    }

    if (scene.isDirty)
    {
        scene.updateGraph();
    }
};
