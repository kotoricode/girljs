import { Dialogue } from "../dialogue";
import { Mouse } from "../main";
import { Scene } from "../scene";

export const processUi = () =>
{
    if (Dialogue.hasScript())
    {
        if (Mouse.isClicked())
        {
            Dialogue.advance();
        }

        Dialogue.drawBubble();
        Dialogue.drawText(Scene.getDeltaTime());
    }
};

