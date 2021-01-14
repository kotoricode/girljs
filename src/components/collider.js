import { SafeSet } from "../utils/better-builtins";
import { Component } from "./component";

export class Collider extends Component
{
    constructor(...meshes)
    {
        super();

        // TODO: order meshes so that cheapest ones are checked first
        this.meshes = new SafeSet(meshes);
    }

    hasPoint(vec)
    {
        for (const collider of this.meshes)
        {
            if (collider.hasPoint(vec))
            {
                return true;
            }
        }

        return false;
    }

    setPosition(vec)
    {
        for (const collider of this.meshes)
        {
            collider.setPosition(vec);
        }
    }
}
