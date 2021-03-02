import { Dialogue } from "../dialogue";
import { Mouse } from "../main";

export const processUi = () =>
{
    if (Mouse.isClicked())
    {
        if (Dialogue.hasScript())
        {
            Dialogue.advance();
            Mouse.consumeClick();
        }
    }
};

Dialogue.setScript(["one", "two", "three"]);
