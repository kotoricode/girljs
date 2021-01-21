import * as $ from "../const";
import { DEG_TO_RAD } from "../utility";

export class Beziar
{
    constructor(x, y, cp1dist, cp2dist, angle)
    {
        this.cp1dist = cp1dist;
        this.cp2dist = cp2dist;
        this.angle = angle;

        this.setPosition(x, y);
        this.setFromAngle();
    }

    setPosition(x, y)
    {
        this.x = x * $.SCREEN_WIDTH;
        this.y = y * $.SCREEN_HEIGHT;
    }

    setFromAngle()
    {
        const sin = Math.sin(this.angle * DEG_TO_RAD);
        const cos = Math.cos(this.angle * DEG_TO_RAD);

        this.cp1x = this.x + this.cp1dist * cos;
        this.cp1y = this.y - this.cp1dist * sin;
        this.cp2x = this.x + this.cp2dist * -cos;
        this.cp2y = this.y - this.cp2dist * -sin;
    }
}
