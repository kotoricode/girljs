import { DEG_TO_RAD } from "../utility";

export class Beziar
{
    constructor(x, y, cp1dist, cp2dist, angle)
    {
        this.x = x;
        this.y = y;

        const sin = Math.sin(angle);
        const cos = Math.cos(angle);

        this.cp1x = x + cp1dist * cos;
        this.cp1y = y - cp1dist * sin;
        this.cp2x = x + cp2dist * -cos;
        this.cp2y = y - cp2dist * -sin;
    }
}
