import * as $ from "./const";
import { Vector } from "./math/vector";
import { getElement, LISTENER_ONCE } from "./utility";

export const Dom = {
    hideLoading()
    {
        canvas.addEventListener("click", (e) => Mouse.onClick(e));
        canvas.addEventListener("mousemove", (e) => Mouse.setClip(e));
        loading.style.visibility = "hidden";
    }
};

export const Mouse = {
    consumeClick()
    {
        if (!this.isClick) throw Error;

        this.isClick = false;
    },
    onClick(e)
    {
        this.setClip(e);
        this.isPendingClick = true;
    },
    setClick()
    {
        if (!this.isPendingClick) throw Error;

        this.isPendingClick = false;
        this.isClick = true;
    },
    setClip(e)
    {
        const x = (e.clientX - canvasRect.left) / canvas.clientWidth;
        const y = (e.clientY - canvasRect.top) / canvas.clientHeight;

        this.clip.x = 2*x - 1;
        this.clip.y = 1 - 2*y;
    },
    clip: new Vector(),
    isClick: false,
    isPendingClick: false,
    pendingClick: new Vector()
};

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

for (const loadEvent of ["DOMContentLoaded", "load"])
{
    window.addEventListener(loadEvent, onResize, LISTENER_ONCE);
}

window.addEventListener("resize", onResize);

const canvas = getElement("canvas");
let canvasRect = canvas.getBoundingClientRect();

export const gl = canvas.getContext("webgl2", { alpha: false });

let canvasWidth = $.RES_WIDTH;
let canvasHeight = $.RES_HEIGHT;
canvas.width = canvasWidth;
canvas.height = canvasHeight;
gl.viewport(0, 0, canvasWidth, canvasHeight);

const loading = getElement("loading");
