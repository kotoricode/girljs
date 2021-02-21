import * as $ from "../const";
import { DEG_TO_RAD } from "../utility";

export class SmoothBezier
{
    constructor(x, y, cpInDist, cpOutDist, angle)
    {
        this.x = x * $.RES_WIDTH;
        this.y = y * $.RES_HEIGHT;
        this.cpInDist = cpInDist;
        this.cpOutDist = cpOutDist;
        this.angle = angle;

        this.setControlPoints();
    }

    setPosition(x, y)
    {
        this.x = x * $.RES_WIDTH;
        this.y = y * $.RES_HEIGHT;
    }

    setControlPoints()
    {
        const sin = Math.sin(this.angle * DEG_TO_RAD);
        const cos = Math.cos(this.angle * DEG_TO_RAD);

        this.cpInX = this.x + this.cpInDist * cos;
        this.cpInY = this.y - this.cpInDist * sin;
        this.cpOutX = this.x - this.cpOutDist * cos;
        this.cpOutY = this.y + this.cpOutDist * sin;
    }

    setDelta(x, y, cpInDist, cpOutDist, angle)
    {
        this.x += x * $.RES_WIDTH;
        this.y += y * $.RES_HEIGHT;
        this.cpInDist += cpInDist;
        this.cpOutDist += cpOutDist;
        this.angle += angle;

        this.setControlPoints();
    }
}
