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
        this.direction.from(this.end);
        this.direction.sub(this.start);
        this.direction.normalize();
    }

    fromMouse(ivp, mouse)
    {
        const { x, y } = mouse;
        const w = ivp[3]*x + ivp[7]*y + ivp[15];
        const zw = ivp[11];
        const iwNear = w - zw;
        const iwFar = w + zw;

        for (let i = 0; i < 3; i++)
        {
            const coord = ivp[i]*x + ivp[4+i]*y + ivp[12+i];
            const zcoord = ivp[8+i];
            this.start[i] = (coord - zcoord) / iwNear;
            this.end[i] = (coord + zcoord) / iwFar;
        }

        this.setDirection();
    }

    collideBox(box)
    {
        const multi = this.start.z / this.direction.z;
        const x = this.start.x - multi*this.direction.x;

        if (box.min.x <= x && x <= box.max.x)
        {
            const y = this.start.y - multi*this.direction.y;

            if (box.min.y <= y && y <= box.max.y)
            {
                this.addHit(x, y, 0);
            }
        }
    }

    collideGround(ground)
    {
        const multi = this.start.y / this.direction.y;
        const x = this.start.x - multi*this.direction.x;

        if (ground.min.x <= x && x <= ground.max.x)
        {
            const z = this.start.z - multi*this.direction.z;

            if (ground.min.z <= z && z <= ground.max.z)
            {
                this.addHit(x, 0, z);
            }
        }
    }

    addHit(x, y, z)
    {
        if (this.numHits === this.hit.length)
        {
            const vec = new Vector();
            this.hit.push(vec);
        }

        const vec = this.hit[this.numHits++];
        vec.setValues(x, y, z);
    }
}
