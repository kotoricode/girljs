import { Point } from "@pixi/math";

export class PathNode
{
    constructor(x, y)
    {
        this.score = 0;
        this.comeFrom = null;
        this.position = new Point(x, y);
        this.adjacent = new Map(); // <adjacent, distanceTo>

        this.isAdjacentToStart = false;
        this.isAdjacentToEnd = false;
    }
}
