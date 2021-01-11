import * as $ from "../const";
import { Motion } from "../components/motion";
import { Space } from "../components/space";
import { Sprite } from "../components/sprite";
import { Vector } from "../math/vector";

export const processMotion = (scene) =>
{
    for (const [motion, space, sprite] of scene.all(Motion, Space, Sprite))
    {
        if (space.isDirty)
        {
            throw space;
        }

        if (motion.hasTarget())
        {
            const { direction } = motion;

            // Distance to target
            const target = motion.getTarget();
            distance.copyFrom(target);
            distance.subVec(space.world.translation);

            // Direction
            direction.copyFrom(distance);
            direction.normalize();

            // Flip sprite X according to direction
            if (direction.x)
            {
                space.local.scale.x = Math.sign(direction.x);

                if (direction.x > 0)
                {
                    sprite.setModel($.MODEL_PLAYER2);
                }
                else
                {
                    sprite.setModel($.MODEL_PLAYER);
                }
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
            space.local.translation.addVec(distance);
            scene.markDirty(space);
        }
    }

    if (scene.isDirty)
    {
        scene.updateGraph();
    }
};

const distance = new Vector();
