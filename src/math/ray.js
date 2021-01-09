import { Vector3 } from "./vector3";

export class Ray
{
    constructor(origin, target)
    {
        this.origin = origin;
        this.target = target;

        this.direction = new Vector3();
        this.setDirection(target);

        this.numHits = 0;
        this.hit = [];
    }

    setDirection()
    {
        this.direction.set(
            this.target.x - this.origin.x,
            this.target.y - this.origin.y,
            this.target.z - this.origin.z
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
            this.origin[i] = (coord - zcoord) * iwNear;
            this.target[i] = (coord + zcoord) * iwFar;
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
        const multi = -this.origin.y / this.direction.y;
        const x = this.origin.x + multi*this.direction.x;

        if (box.min.x <= x && x <= box.max.x)
        {
            const z = this.origin.z + multi*this.direction.z;

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
            this.hit.push(new Vector3());
        }

        this.hit[this.numHits++].set(x, y, z);
    }
}
