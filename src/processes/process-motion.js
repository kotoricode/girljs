import { Motion } from "../components/motion";
import { Transform } from "../components/transform";
import { Vector3 } from "../math/vector3";

const dist = new Vector3();

export const processMotion = (scene) =>
{
    for (const [motion, xform] of scene.all(Motion, Transform))
    {
        if (xform.isDirty)
        {
            throw xform;
        }

        if (motion.hasTarget())
        {
            const { local, world } = xform;

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
            xform.isDirty = true;
            scene.isDirty = true;
        }
    }

    if (scene.isDirty)
    {
        scene.updateGraph();
    }
};
