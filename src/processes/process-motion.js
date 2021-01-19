import { Motion } from "../components/motion";
import { Space } from "../components/space";
import { Dialogue } from "../gl/dialogue";
import { Vector } from "../math/vector";

export const processMotion = (scene) =>
{
    for (const [motion, space] of scene.all(Motion, Space))
    {
        if (space.isDirty) throw Error;

        if (motion.hasTarget())
        {
            const { direction } = motion;

            Dialogue.setText("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.");

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
