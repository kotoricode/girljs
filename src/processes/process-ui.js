import { UiArea, UiDialogue } from "../ui";
import { Mouse } from "../main";
import { Scene } from "../scene";

export const processUi = () =>
{
    const dt = Scene.getDeltaTime();

    if (UiDialogue.isActive())
    {
        UiDialogue.clear();

        if (Mouse.isClick())
        {
            Mouse.consume();
            UiDialogue.advance();

            if (UiDialogue.isActive())
            {
                drawDialogue(dt);
            }
        }
        else
        {
            drawDialogue(dt);
        }
    }

    if (!UiArea.isStarted())
    {
        UiArea.activate("moi");
        UiDialogue.activate([
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            "Duis aute irure dolor in reprehenderit in voluptate velit....",
            "four",
            "final five"
        ]);
    }

    if (UiArea.isActive())
    {
        UiArea.clear();
        UiArea.update(dt);

        if (UiArea.isActive())
        {
            UiArea.draw();
        }
    }
};

const drawDialogue = (dt) =>
{
    UiDialogue.drawBubble(3, 1.5, -0.3);
    UiDialogue.drawText(dt, "#333333");
};
