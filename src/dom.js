import * as CONST from "./const";
import { Vector3 } from "./math/vector3";
import { publish } from "./publisher";

export const storage = window.localStorage;

const gameCanvas = window.document.getElementById("gameCanvas");
export const gl = gameCanvas.getContext("webgl2", { alpha: false });

const container = window.document.getElementById("container");

const uiCanvas = window.document.getElementById("uiCanvas");
const uiStyle = uiCanvas.style;
const uiCtx = uiCanvas.getContext("2d");

uiCtx.beginPath();
uiCtx.arc(75, 75, 50, 0, Math.PI * 2, true); // Outer circle
uiCtx.moveTo(110, 75);
uiCtx.arc(75, 75, 35, 0, Math.PI, false); // Mouth (clockwise)
uiCtx.moveTo(65, 65);
uiCtx.arc(60, 65, 5, 0, Math.PI * 2, true); // Left eye
uiCtx.moveTo(95, 65);
uiCtx.arc(90, 65, 5, 0, Math.PI * 2, true); // Right eye
uiCtx.stroke();

uiCtx.fillStyle = "white";
uiCtx.fillRect(0, 0, uiCanvas.width, uiCanvas.height);

/*------------------------------------------------------------------------------
    Canvas area
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

container.addEventListener("click", (e) => onClick(e));
container.addEventListener("contextmenu", (e) => e.preventDefault());

uiCanvas.addEventListener("click", (e) =>
{
    e.stopPropagation();
});
