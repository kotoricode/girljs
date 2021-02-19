import { Space } from "../components/space";
import { Camera } from "../camera";
import { Scene } from "../scene";

export const processCameraPosition = () =>
{
    const focusedEntityId = Camera.getFocusEntityId();

    if (focusedEntityId)
    {
        const [space] = Scene.one(focusedEntityId, Space);
        Camera.setPosition(space.world.translation);
    }
};
