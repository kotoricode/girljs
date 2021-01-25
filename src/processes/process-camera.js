import { Space } from "../components/space";
import { Camera } from "../camera";
import { Scene } from "../scene";

export const processCamera = () =>
{
    const focus = Camera.getFocusEntityId();

    if (focus)
    {
        const entity = Scene.getEntity(focus);
        const space = entity.getComponent(Space);

        Camera.setPosition(space.world.translation);
    }
};
