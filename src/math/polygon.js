import { Segment } from "./segment";
import { Vector2 } from "./vector2";

export class Polygon
{
    constructor(points)
    {
        if (points.length < 3)
        {
            // must have volume
            throw Error;
        }

        this.points = points;
        this.activeSegment = new Segment(new Vector2(), new Vector2());

        this.intersections = [];
        this.idx = -1;
    }

    addIntersection(point)
    {
        this.idx++;

        if (this.idx < this.intersections.length)
        {
            this.intersections[this.idx].copyFrom(point);
        }
        else
        {
            const intersection = point.clone();
            this.intersections.push(intersection);
        }
    }

    getIntersections(line)
    {
        this.idx = -1;

        for (let i = 0; i < this.points.length;)
        {
            this.activeSegment.set(
                this.points[i],
                this.points[++i % this.points.length]
            );

            const point = this.activeSegment.getIntersection(line);

            if (point)
            {
                this.addIntersection(point);
            }
        }

        // for (let i = 0; i <= this.idx; i++)
        // {
        //     yield this.intersections[i];
        // }
    }
}
