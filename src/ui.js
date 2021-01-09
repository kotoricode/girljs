
import { ui } from "./dom";

export const clearUi = () =>
{
    const { width, height } = ui.canvas;
    ui.clearRect(0, 0, width, height);
};

export const drawCircle = () =>
{
    ui.strokeStyle = "white";

    ui.beginPath();
    ui.arc(75, 75, 50, 0, Math.PI * 2, true); // Outer circle
    ui.stroke();
};

export const drawDialogue = (str) =>
{
    ui.strokeStyle = "white";
    ui.fillStyle = "white";
    ui.font = "30px Arial";
    ui.fillText(str, 10, 50);
};

export const drawLine = () =>
{

};

export const drawRectangle = () =>
{

};

export const isUiInteraction = () =>
{
    clearUi();
    drawDialogue(Date.now() + "");

    return false;
};

