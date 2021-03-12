import { Area, Dialogue, Ui } from "../ui";
import { Mouse } from "../main";
import { Scene } from "../scene";

export const processUi = () =>
{
    const dt = Scene.getDeltaTime();

    if (Dialogue.isActive())
    {
        Dialogue.clear();

        if (Mouse.isClick())
        {
            Mouse.consume();
            Dialogue.advance();

            if (Dialogue.isActive())
            {
                drawDialogue(dt);
            }
        }
        else
        {
            drawDialogue(dt);
        }
    }

    if (!Area.isStarted())
    {
        Area.activate("moi");
    }

    Area.clear();
    Area.draw(dt);

    Ui.canvasToTexture();
};

const drawDialogue = (dt) =>
{
    Dialogue.drawBubble(3, 1.5, -0.3);
    Dialogue.drawText(dt, "#333333");
};
