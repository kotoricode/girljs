import * as $ from "./const";
import { AudioPlayer } from "./audio-player";
import { Vector } from "./math/vector";
import { Publisher } from "./utils/publisher";
import { isUiInteraction } from "./ui";

export const LISTENER_ONCE = { once: true };

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
            uiCanvas.style.width = width + "px";
            uiCanvas.style.height = height + "px";

            gl.viewport(0, 0, width, height);
            Publisher.publish($.EVENT_RESIZED);
        }
    }

    canvasRect = gameCanvas.getBoundingClientRect();
};

// Modern browsers won't autoplay audio before user interaction
window.addEventListener("mousedown", AudioPlayer.init, LISTENER_ONCE);

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

let canvasRect;

for (const loadEvent of ["DOMContentLoaded", "load"])
{
    window.addEventListener(loadEvent, onResize, LISTENER_ONCE);
}

window.addEventListener("resize", onResize);

/*------------------------------------------------------------------------------
    Mouse
------------------------------------------------------------------------------*/
export const Mouse = {
    clip: new Vector(),
    screen: new Vector(),
    isWorldClick: false
};

// UI canvas receives clicks, propagate to container if no UI interaction
uiCanvas.addEventListener("click", (e) =>
{
    const x = (e.clientX - canvasRect.left) / gameCanvas.clientWidth;
    const y = (e.clientY - canvasRect.top) / gameCanvas.clientHeight;

    Mouse.clip.set(2*x - 1, 1 - 2*y, 0);
    Mouse.screen.set(x * $.SCREEN_WIDTH, y * $.SCREEN_HEIGHT, 0);

    if (isUiInteraction())
    {
        e.stopPropagation();
    }
    //e.preventDefault();
    //e.stopPropagation();
});

// Container does clicks for in-game clicking (e.g. movement)
canvasHolder.addEventListener("click", () => Mouse.isWorldClick = true);

// Container blocks contextmenu for both canvases
canvasHolder.addEventListener("contextmenu", (e) => e.preventDefault());
