import { Dialogue } from "../dialogue";
import { Mouse } from "../main";

export const processUi = () =>
{
    if (Mouse.isClicked())
    {
        if (Dialogue.hasScript())
        {
            Dialogue.advance();
            //Mouse.consumeClick();
        }
    }

    if (Dialogue.hasScript())
    {
        Dialogue.drawBubble();
    }
};

