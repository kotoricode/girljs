import { HitBox } from "../components/hitbox";
import { Space } from "../components/space";

import { Scene } from "../scene";

export const processSpaces = () =>
{
    for (const [space, hitbox] of Scene.all(Space, HitBox))
    {
        const { min, max } = hitbox;
        const { translation } = space.world;

        min.copy(hitbox.minBounds);
        min.add(translation);

        max.copy(hitbox.maxBounds);
        max.add(translation);
    }
};
