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

    addHit(x, y, z)
    {
        if (this.numHits === this.hit.length)
        {
            const newVec = new Vector();
            this.hit.push(newVec);
        }

        const vec = this.hit[this.numHits++];
        vec.setValues(x, y, z);
    }

    // https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-box-intersection
    collide(box)
    {
        let temp;
        let tmin = -Infinity;
        let tmax = Infinity;

        for (let i = 0; i < 3; i++)
        {
            const start = this.start[i];
            const dir = this.direction[i];

            let min = (box.min[i] - start) / dir;
            let max = (box.max[i] - start) / dir;

            if (min > max)
            {
                temp = min;
                min = max;
                max = temp;
            }

            if (tmin > max || tmax < min)
            {
                return;
            }

            tmin = Math.max(tmin, min);
            tmax = Math.min(tmax, max);
        }

        if (tmin > tmax)
        {
            temp = tmin;
            tmin = tmax;
            tmax = temp;
        }

        this.addHit(
            this.start.x + this.direction.x * tmin,
            this.start.y + this.direction.y * tmin,
            this.start.z + this.direction.z * tmin
        );

        this.addHit(
            this.start.x + this.direction.x * tmax,
            this.start.y + this.direction.y * tmax,
            this.start.z + this.direction.z * tmax
        );
    }

    collideZeroPlane()
    {
        // y direction should be down towards the plane,
        // in front of camera where the cursor is

        // y > 0 -> intersection is behind the camera (opposite of cursor)
        // y == 0 -> no intersection
        if (this.direction.y < 0)
        {
            const multi = this.start.y / this.direction.y;

            const x = this.start.x - multi*this.direction.x;
            const z = this.start.z - multi*this.direction.z;

            this.addHit(x, 0, z);
        }
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

    setDirection()
    {
        this.direction.from(this.end);
        this.direction.subtract(this.start);
        this.direction.normalize();
    }
}
