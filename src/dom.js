import * as CONST from "./const";
import { Vector3 } from "./math/vector3";
import { publish } from "./publisher";

const getElement = (elementId) => window.document.getElementById(elementId);

const container = getElement("container"),
      gameCanvas = getElement("gameCanvas"),
      uiCanvas = getElement("uiCanvas");

export const gl = gameCanvas.getContext("webgl2", { alpha: false });
const ui = uiCanvas.getContext("2d");

const uiStyle = uiCanvas.style;

ui.beginPath();
ui.arc(75, 75, 50, 0, Math.PI * 2, true); // Outer circle
ui.moveTo(110, 75);
ui.arc(75, 75, 35, 0, Math.PI, false); // Mouth (clockwise)
ui.moveTo(65, 65);
ui.arc(60, 65, 5, 0, Math.PI * 2, true); // Left eye
ui.moveTo(95, 65);
ui.arc(90, 65, 5, 0, Math.PI * 2, true); // Right eye
ui.stroke();

ui.fillStyle = "white";
ui.fillRect(0, 0, uiCanvas.width, uiCanvas.height);

/*------------------------------------------------------------------------------
    Canvases
------------------------------------------------------------------------------*/
export const canvasMaxWidth = 1280,
             canvasMaxHeight = 720;

export const canvasAspect = canvasMaxWidth / canvasMaxHeight;

let canvasRect;

const onResize = () =>
{
    const width = Math.min(
        window.innerWidth,
        window.innerHeight * canvasAspect,
        canvasMaxWidth
    );

    if (width !== gameCanvas.width)
    {
        const height = width / canvasAspect;

        if (height !== gameCanvas.height)
        {
            gameCanvas.width = width;
            gameCanvas.height = height;

            gl.viewport(0, 0, width, height);
            publish(CONST.EVENT_RESIZE);
        }
    }

    canvasRect = gameCanvas.getBoundingClientRect();
};

for (const resizeEvent of ["DOMContentLoaded", "load", "resize"])
{
    window.addEventListener(resizeEvent, onResize);
}

/*------------------------------------------------------------------------------
    Mouse
------------------------------------------------------------------------------*/
export const mouse = {
    clipCoords: new Vector3(),
    isClick: false
};

const onClick = (e) =>
{
    mouse.clipCoords.set(
        2*(e.clientX-canvasRect.left)/gameCanvas.clientWidth - 1,
        1 - 2*(e.clientY-canvasRect.top)/gameCanvas.clientHeight
    );

    mouse.isClick = true;
};

// UI canvas receives clicks, propagate to container if no UI interaction
uiCanvas.addEventListener("click", (e) =>
{
    e.preventDefault();
    e.stopPropagation();
});

// Container does clicks for in-game clicking (e.g. movement)
container.addEventListener("click", (e) => onClick(e));

// Container blocks contextmenu for both canvases
container.addEventListener("contextmenu", (e) => e.preventDefault());
