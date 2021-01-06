import { Component } from "./component";

export class Collider extends Component
{
    constructor(...meshes)
    {
        super();

        // TODO: order meshes so that cheapest ones are checked first
        this.meshes = new Set(meshes);
    }

    hasPoint(vec2)
    {
        for (const collider of this.meshes)
        {
            if (collider.hasPoint(vec2))
            {
                return true;
            }
        }

        return false;
    }

    setPosition(vec2)
    {
        for (const collider of this.meshes)
        {
            collider.setPosition(vec2);
        }
    }
}
