import { Motion } from "../components/motion";
import { Space } from "../components/space";
import { Vector2 } from "../math/vector2";

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
            const { direction } = motion;

            // Distance to target
            const target = motion.getTarget();
            distance.copyFrom(target);
            distance.subVec(world.translation);

            // Direction
            direction.copyFrom(distance);
            direction.normalize();

            // Flip sprite X according to direction
            if (direction.x)
            {
                local.scale.x = Math.sign(direction.x);
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
                    direction.set(0, 0);
                    motion.resetTargets();
                }
            }

            // Step to or towards target
            local.translation.addVec(distance);
            scene.markDirty(space);
        }
    }

    if (scene.isDirty)
    {
        scene.updateGraph();
    }
};

const distance = new Vector2();
