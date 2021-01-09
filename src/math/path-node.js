import { Vector3 } from "./vector3";

export class PathNode
{
    constructor(x, y)
    {
        this.score = 0;
        this.comeFrom = null;
        this.position = new Vector3(x, y);
        this.adjacent = new Map(); // <adjacent, distanceTo>

        this.isAdjacentToStart = false;
        this.isAdjacentToEnd = false;
    }
}
