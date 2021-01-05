import { Motion } from "../components/motion";
import { Space } from "../components/space";
import { Vector3 } from "../math/vector3";

const dist = new Vector3();

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

            const mark = motion.getTarget();
            dist.copyFrom(mark);
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
            space.isDirty = true;
            scene.isDirty = true;
        }
    }

    if (scene.isDirty)
    {
        scene.updateGraph();
    }
};
