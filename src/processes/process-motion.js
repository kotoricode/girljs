import { Motion } from "../components/motion";
import { Space } from "../components/space";
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
                direction.copy(target);
                direction.subtract(space.world.translation);
                const distance = direction.magnitude();

                if (step < distance)
                {
                    direction.normalize(step);
                    isMoving = false;
                }
                else
                {
                    step -= distance;
                    motion.nextTarget();
                    isMoving = motion.hasTarget() && step > 0;
                }

                space.local.translation.add(direction);
            }

            if (direction.x)
            {
                space.local.rotation.euler(
                    0,
                    90 + Math.sign(direction.x) * 90,
                    0
                );
            }
        }
    }

    Scene.clean();
};
