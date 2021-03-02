import { Dialogue } from "../dialogue";
import { Mouse } from "../main";

export const processUi = () =>
{
    if (Dialogue.hasScript())
    {
        Dialogue.drawBubble();

        if (Mouse.isClicked())
        {
            Dialogue.advance();
        }
    }
};

