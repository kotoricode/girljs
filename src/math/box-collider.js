import { Vector2 } from "./vector2";

export class BoxCollider
{
    constructor(x, y, width, height, anchorX=0, anchorY=0)
    {
        this.position = new Vector2(x, y);
        this.bottomRight = new Vector2(x + width, y + height);

        this.width = width;
        this.height = height;

        this.anchor = new Vector2(anchorX, anchorY);
    }

    hasPoint({ x, y })
    {
        return this.position.x <= x && x <= this.bottomRight.x &&
               this.position.y <= y && y <= this.bottomRight.y;
    }

    setPosition({ x, y })
    {
        const posX = x - this.anchor.x*this.width;
        const posY = y - this.anchor.y*this.height;

        this.position.set(posX, posY);
        this.bottomRight.set(posX + this.width, posY + this.height);
    }
}
