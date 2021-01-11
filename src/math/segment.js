import { Vector } from "./vector";

export class Segment
{
    constructor(startX, startZ, endX, endZ)
    {
        this.start = new Vector(startX, 0, startZ);
        this.end = new Vector(endX, 0, endZ);
        this.intersection = new Vector();
    }

    getIntersection(line, isPoly=true)
    {
        const ax = this.end.x - this.start.x;
        const az = this.end.z - this.start.z;
        const bx = line.end.x - line.start.x;
        const bz = line.end.z - line.start.z;
        const det = ax*bz - bx*az;

        if (det)
        {
            const cx = this.start.x - line.start.x;
            const cz = this.start.z - line.start.z;
            const s = (ax*cz - az*cx) / det;

            if (0 <= s && s <= 1)
            {
                const t = (bx*cz - bz*cx) / det;

                // with polygons segments are half-open
                // one segment's end point is other segment's start point
                // intersection at that point should be registered just once
                if (0 <= t && (isPoly ? t < 1 : t <= 1))
                {
                    return this.intersection.set(
                        this.start.x + (t * ax),
                        0,
                        this.start.z + (t * az)
                    );
                }
            }
        }
    }

    set(start, end)
    {
        this.start.from(start);
        this.end.from(end);
    }
}
