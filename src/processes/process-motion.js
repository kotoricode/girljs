import { Motion } from "../components/motion";
import { Space } from "../components/space";
import { Vector } from "../math/vector";
import { Scene } from "../scene";

export const processMotion = (dt) =>
{
    for (const [motion, space] of Scene.all(Motion, Space))
    {
        if (motion.hasTarget())
        {
            const { direction } = motion;

            // Distance to target
            const target = motion.getTarget();
            distance.from(target);
            distance.subtract(space.world.translation);

            // Direction
            direction.from(distance);
            direction.normalize();

            // Flip drawable X according to direction
            if (direction.x)
            {
                space.local.rotation.fromEuler(
                    0,
                    Math.sign(direction.x) > 0 ? 0 : 180,
                    0
                );
            }

            const moveDistance = motion.speed * dt;

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
            Scene.markDirty(space);
        }
    }
};

const distance = new Vector();
