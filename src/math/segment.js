import { Vector2 } from "./vector2";

export class Segment
{
    constructor(startX, startY, endX, endY)
    {
        this.start = new Vector2(startX, startY);
        this.end = new Vector2(endX, endY);

        this.intersection = new Vector2();
    }

    getIntersection(line, isPoly=true)
    {
        const ax = this.end.x - this.start.x,
              ay = this.end.y - this.start.y,
              bx = line.end.x - line.start.x,
              by = line.end.y - line.start.y;

        const det = ax*by - bx*ay;

        if (det)
        {
            const cx = this.start.x - line.start.x,
                  cy = this.start.y - line.start.y;

            const s = (ax*cy - ay*cx) / det;

            if (0 <= s && s <= 1)
            {
                const t = (bx*cy - by*cx) / det;

                // with polygons segments are half-open
                // one segment's end point is other segment's start point
                // intersection at that point should be registered just once
                if (0 <= t && (isPoly ? t < 1 : t <= 1))
                {
                    return this.intersection.set(
                        this.start.x + (t * ax),
                        this.start.y + (t * ay)
                    );
                }
            }
        }
    }

    set(start, end)
    {
        this.start.copyFrom(start);
        this.end.copyFrom(end);
    }
}
