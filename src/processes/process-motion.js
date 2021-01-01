import { Motion } from "../components/motion";
import { Transform } from "../components/transform";
import { Vector3 } from "../math/vector3";

const dist = new Vector3();

export const processMotion = (scene) =>
{
    if (scene.isGraphDirty)
    {
        scene.updateGraph();
    }

    for (const [motion, transform] of scene.all(Motion, Transform))
    {
        if (transform.isDirty)
        {
            throw transform;
        }

        if (motion.hasTarget())
        {
            const mark = motion.getTarget();
            dist.copyFrom(mark);
            dist.subVec(transform.world.translation);

            if (dist.x)
            {
                transform.local.scale.x = Math.sign(dist.x);
            }

            const step = motion.speed * scene.dt;

            if (step**2 < dist.sqrMag())
            {
                dist.normalize(step);
            }
            else
            {
                motion.curMark++;

                if (motion.curMark > motion.maxMark)
                {
                    motion.resetTargets();
                }
            }

            transform.local.translation.addVec(dist);
            transform.isDirty = true;
        }
    }

    scene.updateGraph();
};
