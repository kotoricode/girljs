import { Vector } from "./vector";

export class PathNode
{
    constructor(x, y, z)
    {
        this.score = 0;
        this.comeFrom = null;
        this.position = new Vector(x, y, z);
        this.adjacent = new Map(); // <adjacent, distanceTo>

        this.isAdjacentToStart = false;
        this.isAdjacentToEnd = false;
    }
}
