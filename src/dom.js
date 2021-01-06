import { initAudio } from "./audio";
import { Vector2 } from "./math/vector2";
import { publish } from "./utils/publisher";
import { ONE_TIME_LISTENER } from "./math/math-helper";

import * as $ from "./utils/const";
import { clearUi, drawCircle, isUiInteraction } from "./ui";

// Modern browsers won't autoplay audio before user interaction
window.addEventListener("mousedown", initAudio, ONE_TIME_LISTENER);

const getElement = (elementId) => window.document.getElementById(elementId);

const canvasHolder = getElement("canvasHolder"),
      gameCanvas = getElement("gameCanvas"),
      uiCanvas = getElement("uiCanvas");

export const gl = gameCanvas.getContext("webgl2", { alpha: false });
export const ui = uiCanvas.getContext("2d");

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
    clip: new Vector2(),
    isClick: false
};

const onClick = (e) =>
{
    const x = 2*(e.clientX-canvasRect.left)/gameCanvas.clientWidth - 1;
    const y = 1 - 2*(e.clientY-canvasRect.top)/gameCanvas.clientHeight;

    mouse.clip.set(x, y);
    mouse.isClick = true;
};

// UI canvas receives clicks, propagate to container if no UI interaction
uiCanvas.addEventListener("click", (e) =>
{
    if (isUiInteraction())
    {
        e.stopPropagation();
    }
    //e.preventDefault();
    //e.stopPropagation();
});

// Container does clicks for in-game clicking (e.g. movement)
canvasHolder.addEventListener("click", (e) => onClick(e));

// Container blocks contextmenu for both canvases
canvasHolder.addEventListener("contextmenu", (e) => e.preventDefault());
