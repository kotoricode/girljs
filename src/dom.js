import * as $ from "./const";
import { Vector } from "./math/vector";
import { getElement, LISTENER_ONCE } from "./utility";

export const Dom = {
    hideLoading()
    {
        canvas.addEventListener("click", (e) =>
        {
            mouseEvent = e;
            isClickPending = true;
        });
        canvas.addEventListener("mousemove", (e) => mouseEvent = e);
        loading.style.visibility = "hidden";
    }
};

const loading = getElement("loading");

/*------------------------------------------------------------------------------
    Mouse
------------------------------------------------------------------------------*/
export const Mouse = {
    consumeClick()
    {
        isMouseClick = false;
    },
    getClip()
    {
        return mouseClip;
    },
    isClick()
    {
        return isMouseClick;
    },
    update()
    {
        isMouseClick = false;

        if (isClickPending || mouseEvent)
        {
            const x = (mouseEvent.clientX-canvasRect.left) / canvas.clientWidth;
            const y = (mouseEvent.clientY-canvasRect.top) / canvas.clientHeight;

            mouseClip.x = 2 * x - 1;
            mouseClip.y = 1 - 2 * y;
            mouseEvent = null;

            if (isClickPending)
            {
                isMouseClick = true;
                isClickPending = false;
            }
        }
    },
};

let isMouseClick = false;
let isClickPending = false;
const mouseClip = new Vector();
let mouseEvent;

/*------------------------------------------------------------------------------
    Resize
------------------------------------------------------------------------------*/
const onResize = () =>
{
    const width = Math.min(
        window.innerWidth,
        window.innerHeight * $.RES_ASPECT,
        $.RES_WIDTH
    );

    if (width !== canvasWidth)
    {
        const height = width / $.RES_ASPECT;

        if (height !== canvasHeight)
        {
            canvasWidth = width;
            canvasHeight = height;

            canvas.style.width = width + "px";
            canvas.style.height = height + "px";
        }
    }

    canvasRect = canvas.getBoundingClientRect();
};

window.addEventListener("DOMContentLoaded", onResize, LISTENER_ONCE);
window.addEventListener("load", onResize, LISTENER_ONCE);
window.addEventListener("resize", onResize);

/*------------------------------------------------------------------------------
    Init
------------------------------------------------------------------------------*/
const canvas = getElement("canvas");
let canvasRect = canvas.getBoundingClientRect();

export const gl = canvas.getContext("webgl2", { alpha: false });

let canvasWidth = $.RES_WIDTH;
let canvasHeight = $.RES_HEIGHT;
canvas.width = canvasWidth;
canvas.height = canvasHeight;
gl.viewport(0, 0, canvasWidth, canvasHeight);
