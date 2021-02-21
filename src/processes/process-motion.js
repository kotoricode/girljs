import { Motion } from "../components/motion";
import { Space } from "../components/space";
import { Vector } from "../math/vector";
import { Scene } from "../scene";

export const processMotion = () =>
{
    const dt = Scene.getDeltaTime();

    for (const [motion, space] of Scene.all(Motion, Space))
    {
        if (motion.hasTarget())
        {
            Scene.markDirty(space);

            const { direction } = motion;
            let step = motion.speed * dt;
            let isMoving = true;

            while (isMoving)
            {
                const target = motion.getTarget();
                distance.from(target);
                distance.subtract(space.world.translation);
                const distToTarget = distance.magnitude();

                if (distToTarget <= step)
                {
                    step -= distToTarget;
                    space.local.translation.add(distance);
                    motion.nextTarget();
                    isMoving = motion.hasTarget();
                }
                else
                {
                    direction.from(distance);
                    direction.normalize(step);
                    space.local.translation.add(direction);
                    isMoving = false;
                }
            }

            if (distance.x)
            {
                space.local.rotation.fromEuler(
                    0,
                    90 + Math.sign(distance.x) * 90,
                    0
                );
            }
        }
    }

    Scene.clean();
};

const distance = new Vector();
