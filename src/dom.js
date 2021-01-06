import { initAudio } from "./audio";
import { Vector2 } from "./math/vector2";
import { publish } from "./utils/publisher";
import { isUiInteraction } from "./ui";

import * as $ from "./utils/const";

// Modern browsers won't autoplay audio before user interaction
window.addEventListener("mousedown", initAudio, { once: true });

const getElement = (elementId) => window.document.getElementById(elementId);

const canvasHolder = getElement("canvasHolder"),
      gameCanvas = getElement("gameCanvas"),
      uiCanvas = getElement("uiCanvas");

export const gl = gameCanvas.getContext("webgl2", { alpha: false });
export const ui = uiCanvas.getContext("2d");

/*------------------------------------------------------------------------------
    Canvases
------------------------------------------------------------------------------*/
// UI canvas is scaled rather than resized, so width & height never change
uiCanvas.width = $.SCREEN_WIDTH;
uiCanvas.height = $.SCREEN_HEIGHT;
const uiStyle = uiCanvas.style;

let canvasRect;

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
    clip: new Vector2(),
    screen: new Vector2(),
    isClick: false
};

const setMousePosition = (e) =>
{
    const relX = (e.clientX - canvasRect.left) / gameCanvas.clientWidth,
          relY = (e.clientY - canvasRect.top) / gameCanvas.clientHeight;

    mouse.screen.set(relX * $.SCREEN_WIDTH, relY * $.SCREEN_HEIGHT);
    mouse.clip.set(2*relX - 1, 1 - 2*relY);
};

// UI canvas receives clicks, propagate to container if no UI interaction
uiCanvas.addEventListener("click", (e) =>
{
    setMousePosition(e);

    if (isUiInteraction())
    {
        e.stopPropagation();
    }
    //e.preventDefault();
    //e.stopPropagation();
});

// Container does clicks for in-game clicking (e.g. movement)
canvasHolder.addEventListener("click", () =>
{
    mouse.isClick = true;
});

// Container blocks contextmenu for both canvases
canvasHolder.addEventListener("contextmenu", (e) => e.preventDefault());
