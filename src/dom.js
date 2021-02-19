import * as $ from "./const";
import { Vector } from "./math/vector";
import { getElement, LISTENER_ONCE } from "./utility";

export const Dom = {
    hideLoading()
    {
        canvas.addEventListener("click", (e) =>
        {
            mouseEvent = e;
            isClickedPending = true;
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
        isMouseClicked = false;
    },
    getClip()
    {
        return mouseClip;
    },
    isClicked()
    {
        return isMouseClicked;
    },
    update()
    {
        isMouseClicked = false;

        if (mouseEvent || isClickedPending)
        {
            const x = (mouseEvent.clientX-canvasRect.left) / canvas.clientWidth;
            const y = (mouseEvent.clientY-canvasRect.top) / canvas.clientHeight;

            mouseClip.x = 2 * x - 1;
            mouseClip.y = 1 - 2 * y;
            mouseEvent = null;

            if (isClickedPending)
            {
                isMouseClicked = true;
                isClickedPending = false;
            }
        }
    },
};

let isMouseClicked = false;
let isClickedPending = false;
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

        canvasWidth = width;

        canvas.style.width = width + "px";
        canvas.style.height = height + "px";
    }

    canvasRect = canvas.getBoundingClientRect();
};

const canvas = getElement("canvas");
let canvasRect = canvas.getBoundingClientRect();
let canvasWidth = $.RES_WIDTH;
canvas.width = $.RES_WIDTH;
canvas.height = $.RES_HEIGHT;

window.addEventListener("DOMContentLoaded", onResize, LISTENER_ONCE);
window.addEventListener("load", onResize, LISTENER_ONCE);
window.addEventListener("resize", onResize);

export const gl = canvas.getContext("webgl2", { alpha: false });
gl.viewport(0, 0, $.RES_WIDTH, $.RES_HEIGHT);
