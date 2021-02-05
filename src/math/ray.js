import { Camera } from "../camera";
import { Mouse } from "../dom";
import { Vector } from "./vector";

export class Ray
{
    constructor(sx, sy, sz, ex, ey, ez)
    {
        this.start = new Vector(sx, sy, sz);
        this.direction = new Vector(ex - sx, ey - sy, ez - sz);
        this.direction.normalize();

        this.isHit = false;
        this.hitPoint = new Vector();
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

            this.isHit = true;
            this.hitPoint.setValues(x, 0, z);
        }
        else
        {
            this.isHit = false;
        }
    }

    fromMouse()
    {
        const ivp = Camera.getInvViewProjection();
        const { x, y } = Mouse.getClip();

        const w = ivp[3]*x + ivp[7]*y + ivp[15];
        const zw = ivp[11];
        const iwNear = w - zw;
        const iwFar = w + zw;

        for (let i = 0; i < 3; i++)
        {
            const coord = ivp[i]*x + ivp[4+i]*y + ivp[12+i];
            const zcoord = ivp[8+i];

            const start = (coord - zcoord) / iwNear;

            this.start[i] = start;
            this.direction[i] = ((coord + zcoord) / iwFar) - start;
        }

        this.direction.normalize();
    }
}
