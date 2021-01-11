import * as $ from "./const";
import { initAudio } from "./audio";
import { Vector } from "./math/vector";
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

const once = { once: true };

// Modern browsers won't autoplay audio before user interaction
window.addEventListener("mousedown", initAudio, once);

/*------------------------------------------------------------------------------
    Canvases
------------------------------------------------------------------------------*/
const canvasHolder = getElement("canvasHolder");
const gameCanvas = getElement("gameCanvas");
const uiCanvas = getElement("uiCanvas");

export const gl = gameCanvas.getContext("webgl2", { alpha: false });
export const ui = uiCanvas.getContext("2d");

// UI canvas is scaled rather than resized, so width & height never change
uiCanvas.width = $.SCREEN_WIDTH;
uiCanvas.height = $.SCREEN_HEIGHT;
const uiStyle = uiCanvas.style;

let canvasRect;

for (const loadEvent of ["DOMContentLoaded", "load"])
{
    window.addEventListener(loadEvent, onResize, once);
}

window.addEventListener("resize", onResize);

/*------------------------------------------------------------------------------
    Mouse
------------------------------------------------------------------------------*/
export const mouse = {
    clip: new Vector(),
    screen: new Vector(),
    isWorldClick: false
};

// UI canvas receives clicks, propagate to container if no UI interaction
uiCanvas.addEventListener("click", (e) =>
{
    const x = (e.clientX - canvasRect.left) / gameCanvas.clientWidth;
    const y = (e.clientY - canvasRect.top) / gameCanvas.clientHeight;

    mouse.screen.set(x * $.SCREEN_WIDTH, y * $.SCREEN_HEIGHT);
    mouse.clip.set(2*x - 1, 1 - 2*y);

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
