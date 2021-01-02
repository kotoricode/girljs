import { Vector3 } from "./vector3";

export class Ray
{
    constructor(x, y)
    {
        this.position = new Vector3(x, y);
        this.numHits = 0;
        this.hit = [];
    }

    fromMouse(ivp, mouse)
    {
        const { x, y } = mouse.clipCoords;

        this.position.set(
            x * ivp[0] + ivp[12],
            y * ivp[5] + ivp[13]
        );
    }

    collide(box)
    {
        const { x, y } = this.position;

        if (box.min.x <= x && x <= box.max.x &&
            box.min.y <= y && y <= box.max.y
        )
        {
            this.addHit(x, y);
        }
    }

    addHit(x, y)
    {
        if (this.numHits === this.hit.length)
        {
            this.hit.push(new Vector3());
        }

        this.hit[this.numHits++].set(x, y, 0);
    }
}
