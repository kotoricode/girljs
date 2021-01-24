import { Space } from "../components/space";
import { Camera } from "../camera";

export const processCamera = (scene) =>
{
    const focus = Camera.getFocusEntityId();

    if (focus)
    {
        const entity = scene.getEntity(focus);
        const space = entity.getComponent(Space);

        Camera.setPosition(space.world.translation);
    }
};
