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

    while (true)
    {
        const target = motion.getTarget();
        direction.copy(target);
        direction.subtract(space.world.translation);
        const distance = direction.magnitude();

        if (step < distance)
        {
            // Can't reach target, move full step and stop
            direction.normalize(step);
            space.local.translation.add(direction);

            break;
        }

        // Reach target
        space.local.translation.add(direction);

        if (motion.index === motion.maxIndex)
        {
            // No more targets after this, stop
            motion.direction.setValues(0, 0, 0);
            motion.index = motion.maxIndex = -1;

            break;
        }

        // Proceed to next target
        motion.index++;
        step -= distance;
    }
};

