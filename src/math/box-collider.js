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

    hasPoint(vec)
    {
        return this.position.x <= vec.x && vec.x <= this.bottomRight.x &&
               this.position.y <= vec.y && vec.y <= this.bottomRight.y;
    }

    setPosition(vec)
    {
        const posX = vec.x - this.anchor.x*this.width;
        const posY = vec.y - this.anchor.y*this.height;

        this.position.set(posX, posY);
        this.bottomRight.set(posX + this.width, posY + this.height);
    }
}
