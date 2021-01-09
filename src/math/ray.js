import { Vector } from "./vector";

export class Ray
{
    constructor(sx, sy, sz, ex, ey, ez)
    {
        this.start = new Vector(sx, sy, sz);
        this.end = new Vector(ex, ey, ez);

        this.direction = new Vector();
        this.setDirection(this.end);

        this.numHits = 0;
        this.hit = [];
    }

    setDirection()
    {
        this.direction.set(
            this.end.x - this.start.x,
            this.end.y - this.start.y,
            this.end.z - this.start.z
        );

        this.direction.normalize();
    }

    fromMouse(ivp, mouse)
    {
        const [mx, my] = mouse;

        const w = ivp[3]*mx + ivp[7]*my + ivp[15],
              zw = ivp[11];

        const iwNear = 1 / (w - zw),
              iwFar = 1 / (w + zw);

        for (let i = 0; i < 3; i++)
        {
            const coord = ivp[i]*mx + ivp[4+i]*my + ivp[12+i];
            const zcoord = ivp[8+i];
            this.start[i] = (coord - zcoord) * iwNear;
            this.end[i] = (coord + zcoord) * iwFar;
        }

        this.setDirection();
    }

    // collide(box)
    // {
    //     const multi = -this.origin.z / this.direction.z;
    //     const x = this.origin.x + multi*this.direction.x;

    //     if (box.min.x <= x && x <= box.max.x)
    //     {
    //         const y = this.origin.y + multi*this.direction.y;

    //         if (box.min.y <= y && y <= box.max.y)
    //         {
    //             this.addHit(x, y, 0);
    //         }
    //     }
    // }

    collide(box)
    {
        const multi = -this.start.y / this.direction.y;
        const x = this.start.x + multi*this.direction.x;

        if (box.min.x <= x && x <= box.max.x)
        {
            const z = this.start.z + multi*this.direction.z;

            if (box.min.y <= z && z <= box.max.y)
            {
                this.addHit(x, 0, z);
            }
        }
    }

    addHit(x, y, z)
    {
        if (this.numHits === this.hit.length)
        {
            this.hit.push(new Vector());
        }

        this.hit[this.numHits++].set(x, y, z);
    }
}
