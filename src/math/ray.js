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
        this.direction.subtract(this.start);
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

    // https://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-box-intersection
    collideAABB()
    {
        const box = {
            min: new Vector(-0.5, -0.5, -0.5),
            max: new Vector(0.5, 0.5, 0.5)
        };

        let tmin = (box.min.x - this.start.x) / this.direction.x;
        let tmax = (box.max.x - this.start.x) / this.direction.x;

        if (tmin > tmax)
        {
            [tmin, tmax] = [tmax, tmin];
        }

        let tymin = (box.min.y - this.start.y) / this.direction.y;
        let tymax = (box.max.y - this.start.y) / this.direction.y;

        if (tymin > tymax)
        {
            [tymin, tymax] = [tymax, tymin];
        }

        if ((tmin > tymax) || (tymin > tmax))
        {
            return false;
        }

        if (tymin > tmin)
        {
            tmin = tymin;
        }

        if (tymax < tmax)
        {
            tmax = tymax;
        }

        let tzmin = (box.min.z - this.start.z) / this.direction.z;
        let tzmax = (box.max.z - this.start.z) / this.direction.z;

        if (tzmin > tzmax)
        {
            [tzmin, tzmax] = [tzmax, tzmin];
        }

        if ((tmin > tzmax) || (tzmin > tmax))
        {
            return false;
        }

        if (tzmin > tmin)
        {
            tmin = tzmin;
        }

        if (tzmax < tmax)
        {
            tmax = tzmax;
        }

        console.log(tmin);
        console.log(tmax);

        return true;
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
            const newVec = new Vector();
            this.hit.push(newVec);
        }

        const vec = this.hit[this.numHits++];
        vec.setValues(x, y, z);
    }
}
