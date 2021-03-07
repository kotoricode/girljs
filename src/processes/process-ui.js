import { Dialogue } from "../ui";
import { Mouse } from "../main";
import { Scene } from "../scene";

export const processUi = () =>
{
    if (Dialogue.hasScript())
    {
        const dt = Scene.getDeltaTime();
        Dialogue.draw(dt, "#333333");

        if (Mouse.isClick())
        {
            Dialogue.advance();
        }
    }
};

