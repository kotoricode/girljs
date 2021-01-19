import * as $ from "./const";
import { gl } from "./dom";
import { Vector } from "./math/vector";

export const Mouse = {
    clip: new Vector(),
    screen: new Vector(),
    isWorldClick: false,
    onClick(e)
    {
        const canvasRect = gl.canvas.getBoundingClientRect();

        Mouse.isWorldClick = true;

        const x = (e.clientX - canvasRect.left) / gl.canvas.clientWidth;
        const y = (e.clientY - canvasRect.top) / gl.canvas.clientHeight;

        Mouse.clip.x = 2*x - 1;
        Mouse.clip.y = 1 - 2*y;

        Mouse.screen.x = x * $.SCREEN_WIDTH;
        Mouse.screen.y = y * $.SCREEN_HEIGHT;
    }
};

gl.canvas.addEventListener("click", (e) => Mouse.onClick(e));
