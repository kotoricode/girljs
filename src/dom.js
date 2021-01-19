import * as $ from "./const";
import { Vector } from "./math/vector";
import { Publisher, getElement, LISTENER_ONCE } from "./utility";

export const Mouse = {
    clip: new Vector(),
    screen: new Vector(),
    isWorldClick: false,
    onClick(e)
    {
        Mouse.isWorldClick = true;

        const x = (e.clientX - canvasRect.left) / canvas.clientWidth;
        const y = (e.clientY - canvasRect.top) / canvas.clientHeight;

        Mouse.clip.x = 2*x - 1;
        Mouse.clip.y = 1 - 2*y;

        Mouse.screen.x = x * $.SCREEN_WIDTH;
        Mouse.screen.y = y * $.SCREEN_HEIGHT;
    }
};

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

for (const loadEvent of ["DOMContentLoaded", "load"])
{
    window.addEventListener(loadEvent, onResize, LISTENER_ONCE);
}

window.addEventListener("resize", onResize);

const canvas = getElement("canvas");
let canvasRect = canvas.getBoundingClientRect();
canvas.addEventListener("click", (e) => Mouse.onClick(e));

export const gl = canvas.getContext("webgl2", { alpha: false });
