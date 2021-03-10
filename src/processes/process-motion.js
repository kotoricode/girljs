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
            const { direction } = motion;
            const { local, world } = space;
            let step = motion.speed * dt;
            let hasStep = true;

            while (hasStep)
            {
                const target = motion.getTarget();
                direction.copy(target);
                direction.subtract(world.translation);
                const distance = direction.magnitude();

                if (step < distance)
                {
                    direction.normalize(step);
                    local.translation.add(direction);
                    hasStep = false;
                }
                else
                {
                    local.translation.add(direction);

                    if (++motion.index > motion.maxIndex)
                    {
                        motion.stop();
                        hasStep = false;
                    }
                    else
                    {
                        step -= distance;
                        hasStep = step > 0;
                    }
                }
            }

            if (direction.x)
            {
                const y = 90 + Math.sign(direction.x) * 90;
                local.rotation.euler(0, y, 0);
            }

            Scene.markDirty(space);
        }
    }

    Scene.clean();
};
