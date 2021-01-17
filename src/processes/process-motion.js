import { Motion } from "../components/motion";
import { Space } from "../components/space";
import { Vector } from "../math/vector";

export const processMotion = (scene) =>
{
    for (const [motion, space] of scene.all(Motion, Space))
    {
        if (space.isDirty) throw Error;

        if (motion.hasTarget())
        {
            const { direction } = motion;

            // Distance to target
            const target = motion.getTarget();
            distance.from(target);
            distance.sub(space.world.translation);

            // Direction
            direction.from(distance);
            direction.normalize();

            // Flip sprite X according to direction
            if (direction.x)
            {
                space.local.scale.x = Math.sign(direction.x);
            }

            const moveDistance = motion.speed * scene.dt;

            if (moveDistance < distance.magnitude())
            {
                // Can't reach target yet, step towards it
                distance.normalize(moveDistance);
            }
            else
            {
                // Reaches target, switch to next target
                motion.idx++;

                if (motion.idx > motion.maxIdx)
                {
                    // No more targets, stop moving
                    direction.setValues(0, 0, 0);
                    motion.resetTargets();
                }
            }

            // Step to or towards target
            space.local.translation.add(distance);
            scene.markDirty(space);
        }
    }

    if (scene.isDirty)
    {
        scene.updateGraph();
    }
};

const distance = new Vector();
