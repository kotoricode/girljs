import * as $ from "../const";

import { HitBox } from "../components/hitbox";
import { Space } from "../components/space";

import { Scene } from "../scene";

export const processHitboxes = () =>
{
    for (const [space, hitbox] of Scene.all(Space, HitBox))
    {
        const { min, max } = hitbox;
        const { translation } = space.world;

        min.from(hitbox.minBounds);
        min.add(translation);

        max.from(hitbox.maxBounds);
        max.add(translation);
    }
};
