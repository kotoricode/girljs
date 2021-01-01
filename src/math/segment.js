import { Vector3 } from "./vector3";

export class Segment
{
    constructor(start, end)
    {
        this.start = start;
        this.end = end;

        this.intersection = new Vector3();
    }

    set(start, end)
    {
        this.start.copyFrom(start);
        this.end.copyFrom(end);
    }

    getIntersection(line, isPoly=true)
    {
        const ax = this.end.x - this.start.x,
              ay = this.end.y - this.start.y,
              bx = line.end.x - line.start.x,
              by = line.end.y - line.start.y;

        const det = ax*by - bx*ay;

        if (!det)
        {
            return;
        }

        const cx = this.start.x - line.start.x,
              cy = this.start.y - line.start.y;

        const s = (ax*cy - ay*cx) / det;

        if (s < 0 || 1 < s)
        {
            return;
        }

        const t = (bx*cy - by*cx) / det;

        // with polygons segments are half-open
        // one segment's end point is other segment's start point
        // intersection at that point should be registered just once
        if (t < 0 || (isPoly ? 1 <= t : 1 < t))
        {
            return;
        }

        return this.intersection.set(
            this.start.x + (t * ax),
            this.start.y + (t * ay)
        );
    }
}
