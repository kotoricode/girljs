import * as $ from "./const";
import { AudioPlayer } from "./audio-player";
import { Vector } from "./math/vector";
import { Publisher } from "./utils/publisher";

export const LISTENER_ONCE = { once: true };

const getElement = (elementId) => window.document.getElementById(elementId);

const onResize = () =>
{
    const width = Math.min(
        window.innerWidth,
        window.innerHeight * $.SCREEN_ASPECT,
        $.SCREEN_WIDTH
    );

    if (width !== canvas.width)
    {
        const height = width / $.SCREEN_ASPECT;

        if (height !== canvas.height)
        {
            canvas.width = width;
            canvas.height = height;

            gl.viewport(0, 0, width, height);
            Publisher.publish($.EVENT_RESIZED);
        }
    }

    canvasRect = canvas.getBoundingClientRect();
};

// Modern browsers won't autoplay audio before user interaction
window.addEventListener("mousedown", AudioPlayer.init, LISTENER_ONCE);

/*------------------------------------------------------------------------------
    Canvases
------------------------------------------------------------------------------*/
const canvas = getElement("canvas");
export const gl = canvas.getContext("webgl2", { alpha: false });

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
canvas.addEventListener("click", (e) =>
{
    Mouse.isWorldClick = true;

    const x = (e.clientX - canvasRect.left) / canvas.clientWidth;
    const y = (e.clientY - canvasRect.top) / canvas.clientHeight;

    Mouse.clip.x = 2*x - 1;
    Mouse.clip.y = 1 - 2*y;

    Mouse.screen.x = x * $.SCREEN_WIDTH;
    Mouse.screen.y = y * $.SCREEN_HEIGHT;

    //e.preventDefault();
    //e.stopPropagation();
});

canvas.addEventListener("contextmenu", (e) => e.preventDefault());
