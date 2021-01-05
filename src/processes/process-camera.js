import { mouse } from "../dom";
import { Motion } from "../components/motion";
import { Space } from "../components/space";
import { Ground } from "../components/ground";

import * as $ from "../const";
import { getInvViewProjection, setCameraPosition } from "../camera";
import { Vector3 } from "../math/vector3";

const position = new Vector3();
let numHits = 0;
const hits = [];

const collide = (box) =>
{
    const { min, max } = box;
    const { x, y } = position;

    if (min.x <= x && x <= max.x && min.y <= y && y <= max.y)
    {
        if (numHits === hits.length)
        {
            hits.push(new Vector3());
        }

        hits[numHits++].set(x, y);
    }
};

export const processCamera = (scene) =>
{
    const [pMotion, plSpace] = scene.one($.ENTITY_PLAYER, Motion, Space);

    // Update camera position, matrix
    setCameraPosition(plSpace.world.translation);

    // Update camera ray
    if (mouse.isClick)
    {
        const [ground] = scene.one($.ENTITY_GROUND, Ground);

        numHits = 0;
        const ivp = getInvViewProjection();

        position.copyFrom(mouse.clip);
        position.toWorld(ivp);
        collide(ground);

        // Update player path
        if (numHits)
        {
            const hit = hits[0];
            pMotion.setMainTarget(hit);
        }
    }
};
