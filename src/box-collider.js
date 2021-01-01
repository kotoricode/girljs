import { Vector2 } from "./math/vector2";

export class BoxCollider
{
    constructor(x, y, width, height, anchorX, anchorY)
    {
        this.position = new Vector2(x, y);
        this.bottomRight = new Vector2(x + width, y + height);

        this.width = width;
        this.height = height;

        this.anchor = new Vector2(anchorX, anchorY);
    }

    hasPoint(p)
    {
        return this.position.x <= p.x && p.x <= this.bottomRight.x &&
               this.position.y <= p.y && p.y <= this.bottomRight.y;
    }

    setPosition(pos)
    {
        const posX = pos.x - this.anchor.x * this.width;
        const posY = pos.y - this.anchor.y * this.height;

        this.position.set(posX, posY);
        this.bottomRight.set(posX + this.width, posY + this.height);
    }
}
