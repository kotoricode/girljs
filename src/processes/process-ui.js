import { Dialogue } from "../dialogue";
import { Mouse } from "../main";
import { Scene } from "../scene";

export const processUi = () =>
{
    if (Dialogue.hasScript())
    {
        const dt = Scene.getDeltaTime();
        Dialogue.drawBubble();
        Dialogue.drawText(dt);

        if (Mouse.isClicked())
        {
            Dialogue.advance();
        }
    }
};

