import { Vector } from "../math/vector";
import { Component } from "./component";

export class Ground extends Component
{
    constructor(points)
    {
        if (points.length < 3) throw points;

        super();
        this.points = points;
        this.start = new Vector();
        this.end = new Vector();
        Object.freeze(this);
    }

    isCollision(point, origin)
    {
        for (const isCollision of this.yieldCollisionTests(point, origin))
        {
            if (isCollision)
            {
                return true;
            }
        }

        return false;
    }

    isPointWithin(point, origin)
    {
        let numCollisions = 0;

        for (const isCollision of this.yieldCollisionTests(point, origin))
        {
            if (isCollision)
            {
                numCollisions++;
            }
        }

        return numCollisions % 2 === 0;
    }

    * yieldCollisionTests(point, origin)
    {
        let i = 0;
        this.start.from(this.points[i]);

        const ax = point.x - origin.x;
        const az = point.z - origin.z;

        while (i < this.points.length)
        {
            this.end.from(this.points[(i+1) % this.points.length]);

            const bx = this.end.x - this.start.x;
            const bz = this.end.z - this.start.z;
            const det = ax*bz - bx*az;

            if (det)
            {
                const cx = origin.x - this.start.x;
                const cz = origin.z - this.start.z;
                const s = (ax*cz - az*cx) / det;

                if (0 <= s && s <= 1)
                {
                    const t = (bx*cz - bz*cx) / det;

                    // Keep end half-open to avoid double collision at seams
                    yield 0 <= t && t < 1;

                    //intersection.x = start.x + t * ax;
                    //intersection.z = start.z + t * az;
                }
                else
                {
                    yield false;
                }
            }
            else
            {
                yield false;
            }

            this.start.from(this.end);
            i++;
        }
    }
}
