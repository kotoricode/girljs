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
    }

    // https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-box-intersection
    // collide2(box)
    // {
    //     let temp;

    //     let tmin = (box.min.x - this.start.x) / this.direction.x;
    //     let tmax = (box.max.x - this.start.x) / this.direction.x;

    //     if (tmin > tmax)
    //     {
    //         temp = tmin;
    //         tmin = tmax;
    //         tmax = temp;
    //     }

    //     let tymin = (box.min.y - this.start.y) / this.direction.y;
    //     let tymax = (box.max.y - this.start.y) / this.direction.y;

    //     if (tymin > tymax)
    //     {
    //         temp = tymin;
    //         tymin = tymax;
    //         tymax = temp;
    //     }

    //     if (tmin <= tymax && tmax >= tymin)
    //     {
    //         if (tmin < tymin)
    //         {
    //             tmin = tymin;
    //         }

    //         if (tmax > tymax)
    //         {
    //             tmax = tymax;
    //         }

    //         let tzmin = (box.min.z - this.start.z) / this.direction.z;
    //         let tzmax = (box.max.z - this.start.z) / this.direction.z;

    //         if (tzmin > tzmax)
    //         {
    //             temp = tzmin;
    //             tzmin = tzmax;
    //             tzmax = temp;
    //         }

    //         if (tmin <= tzmax && tmax >= tzmin)
    //         {
    //             if (tmin < tzmin)
    //             {
    //                 tmin = tzmin;
    //             }

    //             if (tmax > tzmax)
    //             {
    //                 tmax = tzmax;
    //             }

    //             if (tmin > tmax)
    //             {
    //                 temp = tmin;
    //                 tmin = tmax;
    //                 tmax = temp;
    //             }

    //             this.addHit(
    //                 this.start.x + this.direction.x * tmin,
    //                 this.start.y + this.direction.y * tmin,
    //                 this.start.z + this.direction.z * tmin
    //             );
    //         }
    //     }
    // }

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
