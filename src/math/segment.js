import { Vector } from "./vector";

export class Segment
{
    constructor(startX, startZ, endX, endZ)
    {
        this.start = new Vector(startX, 0, startZ);
        this.end = new Vector(endX, 0, endZ);
        this.intersection = new Vector();
    }

    getIntersection(other, isOpenS1, isOpenS2, isOpenT1, isOpenT2)
    {
        const ax = this.end.x - this.start.x;
        const az = this.end.z - this.start.z;
        const bx = other.end.x - other.start.x;
        const bz = other.end.z - other.start.z;
        const det = ax*bz - bx*az;

        if (det)
        {
            const cx = this.start.x - other.start.x;
            const cz = this.start.z - other.start.z;
            const s = (ax*cz - az*cx) / det;

            if (isOpenS1 ? (0 < s) : (0 <= s) &&
                isOpenS2 ? (s < 1) : (s <= 1))
            {
                const t = (bx*cz - bz*cx) / det;

                if (isOpenT1 ? (0 < t) : (0 <= t) &&
                    isOpenT2 ? (t < 1) : (t <= 1))
                {
                    return this.intersection.setValues(
                        this.start.x + t * ax,
                        0,
                        this.start.z + t * az
                    );
                }
            }
        }
    }

    setStartEnd(start, end)
    {
        this.start.from(start);
        this.end.from(end);
    }
}
