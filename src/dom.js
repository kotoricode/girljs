import * as $ from "./const";
import { initAudio } from "./audio";
import { Vector3 } from "./math/vector3";
import { publish } from "./utils/publisher";
import { isUiInteraction } from "./ui";

const getElement = (elementId) => window.document.getElementById(elementId);

const onResize = () =>
{
    const width = Math.min(
        window.innerWidth,
        window.innerHeight * $.SCREEN_ASPECT,
        $.SCREEN_WIDTH
    );

    if (width !== gameCanvas.width)
    {
        const height = width / $.SCREEN_ASPECT;

        if (height !== gameCanvas.height)
        {
            gameCanvas.width = width;
            gameCanvas.height = height;

            uiStyle.width = width + "px";
            uiStyle.height = height + "px";

            gl.viewport(0, 0, width, height);
            publish($.EVENT_CANVAS_RESIZED);
        }
    }

    canvasRect = gameCanvas.getBoundingClientRect();
};

// Modern browsers won't autoplay audio before user interaction
window.addEventListener("mousedown", initAudio, { once: true });

/*------------------------------------------------------------------------------
    Canvases
------------------------------------------------------------------------------*/
const canvasHolder = getElement("canvasHolder"),
      gameCanvas = getElement("gameCanvas"),
      uiCanvas = getElement("uiCanvas");

export const gl = gameCanvas.getContext("webgl2", { alpha: false });
export const ui = uiCanvas.getContext("2d");

// UI canvas is scaled rather than resized, so width & height never change
uiCanvas.width = $.SCREEN_WIDTH;
uiCanvas.height = $.SCREEN_HEIGHT;
const uiStyle = uiCanvas.style;

let canvasRect;

for (const resizeEvent of ["DOMContentLoaded", "load", "resize"])
{
    window.addEventListener(resizeEvent, onResize);
}

/*------------------------------------------------------------------------------
    Mouse
------------------------------------------------------------------------------*/
export const mouse = {
    clip: new Vector3(),
    screen: new Vector3(),
    isWorldClick: false
};

// UI canvas receives clicks, propagate to container if no UI interaction
uiCanvas.addEventListener("click", (e) =>
{
    const relX = (e.clientX - canvasRect.left) / gameCanvas.clientWidth,
          relY = (e.clientY - canvasRect.top) / gameCanvas.clientHeight;

    mouse.screen.set(relX * $.SCREEN_WIDTH, relY * $.SCREEN_HEIGHT);
    mouse.clip.set(2*relX - 1, 1 - 2*relY);

    if (isUiInteraction())
    {
        e.stopPropagation();
    }
    //e.preventDefault();
    //e.stopPropagation();
});

// Container does clicks for in-game clicking (e.g. movement)
canvasHolder.addEventListener("click", () => mouse.isWorldClick = true);

// Container blocks contextmenu for both canvases
canvasHolder.addEventListener("contextmenu", (e) => e.preventDefault());
