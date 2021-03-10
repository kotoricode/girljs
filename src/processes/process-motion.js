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
            moveTowardsTarget(motion, space, dt);

            if (motion.direction.x)
            {
                const y = 90 + Math.sign(motion.direction.x) * 90;
                space.local.rotation.euler(0, y, 0);
            }

            Scene.markDirty(space);
        }
    }

    Scene.clean();
};

export const moveTowardsTarget = (motion, space, dt) =>
{
    const { direction } = motion;
    let step = motion.speed * dt;

    while (step > 0)
    {
        const target = motion.getTarget();
        direction.copy(target);
        direction.subtract(space.world.translation);
        const distance = direction.magnitude();

        if (step < distance)
        {
            direction.normalize(step);
            space.local.translation.add(direction);

            return;
        }

        space.local.translation.add(direction);

        if (++motion.index > motion.maxIndex)
        {
            motion.stop();

            return;
        }

        step -= distance;
    }
};

