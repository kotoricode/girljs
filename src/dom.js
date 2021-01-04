import { initAudio } from "./audio";
import { Vector3 } from "./math/vector3";
import { publish } from "./publisher";
import { ONE_TIME_LISTENER } from "./util";

import * as $ from "./const";

// Modern browsers won't autoplay audio before user interaction
window.addEventListener("mousedown", initAudio, ONE_TIME_LISTENER);

const getElement = (elementId) => window.document.getElementById(elementId);

const canvasHolder = getElement("canvasHolder"),
      gameCanvas = getElement("gameCanvas"),
      uiCanvas = getElement("uiCanvas");

export const gl = gameCanvas.getContext("webgl2", { alpha: false });
export const ui = uiCanvas.getContext("2d");

ui.beginPath();
ui.arc(75, 75, 50, 0, Math.PI * 2, true); // Outer circle
ui.moveTo(110, 75);
ui.arc(75, 75, 35, 0, Math.PI, false); // Mouth (clockwise)
ui.moveTo(65, 65);
ui.arc(60, 65, 5, 0, Math.PI * 2, true); // Left eye
ui.moveTo(95, 65);
ui.arc(90, 65, 5, 0, Math.PI * 2, true); // Right eye
ui.stroke();

// ui.fillStyle = "white";
// ui.fillRect(0, 0, uiCanvas.width, uiCanvas.height);

ui.fillStyle = "black";
ui.font = "30px Arial";
ui.fillText("Hello World", 10, 50);

/*------------------------------------------------------------------------------
    Canvases
------------------------------------------------------------------------------*/
export const canvasMaxWidth = 1152,
             canvasMaxHeight = 648;

// UI canvas is scaled rather than resized, so width & height never change
uiCanvas.width = canvasMaxWidth;
uiCanvas.height = canvasMaxHeight;
const uiStyle = uiCanvas.style;

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

            uiStyle.width = width + "px";
            uiStyle.height = height + "px";

            gl.viewport(0, 0, width, height);
            publish($.EVENT_RESIZE);
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
    clip: new Vector3(),
    isClick: false
};

const onClick = (e) =>
{
    const x = 2*(e.clientX-canvasRect.left)/gameCanvas.clientWidth - 1;
    const y = 1 - 2*(e.clientY-canvasRect.top)/gameCanvas.clientHeight;

    if (x < -1 || 1 < x || y < -1 || 1 < x)
    {
        console.warn(`${x} ${y}`);
    }

    mouse.clip.set(x, y);
    mouse.isClick = true;
};

// UI canvas receives clicks, propagate to container if no UI interaction
uiCanvas.addEventListener("click", (e) =>
{
    e.preventDefault();
    //e.stopPropagation();
});

// Container does clicks for in-game clicking (e.g. movement)
canvasHolder.addEventListener("click", (e) => onClick(e));

// Container blocks contextmenu for both canvases
canvasHolder.addEventListener("contextmenu", (e) => e.preventDefault());
