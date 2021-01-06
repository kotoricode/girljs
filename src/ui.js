import { ui } from "./dom";

let isDialogueMode = false;

export const drawDialogue = (str) =>
{
    isDialogueMode = true;

    ui.strokeStyle = "white";
    ui.fillStyle = "white";
    ui.font = "30px Arial";
    ui.fillText(str, 10, 50);
};

export const drawCircle = (cx, cy, radius) =>
{
    ui.strokeStyle = "white";

    ui.beginPath();
    ui.arc(75, 75, 50, 0, Math.PI * 2, true); // Outer circle
    ui.stroke();
};

export const drawRectangle = (x, y, width, height) =>
{

};

export const drawLine = () =>
{

};

export const clearUi = () =>
{
    const { width, height } = ui.canvas;
    ui.clearRect(0, 0, width, height);
};

export const isUiInteraction = () =>
{
    clearUi();
    drawDialogue(new Date() + "");

    return false;
};
