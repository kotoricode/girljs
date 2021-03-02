import * as $ from "./const";
import { Vector } from "./math/vector";
import { getElement, LISTENER_ONCE } from "./utility";

import { Buffer } from "./gl/buffer";
import { Texture } from "./gl/texture";
import { Program } from "./gl/program";
import { Renderer } from "./gl/renderer";
import { Camera } from "./camera";
import { Dialogue } from "./dialogue";

import { Scene } from "./scene";
import { Model } from "./gl/model";
import { AudioPlayer } from "./audio-player";

const canvasDiv = getElement("canvasDiv");
canvasDiv.innerText = "Click to start";

canvasDiv.addEventListener("mousedown", () =>
{
    canvasDiv.innerText = "Loading...";
    AudioPlayer.init();
    init();

    Model.load().then(() =>
    {
        canvas.addEventListener("mousedown", (e) =>
        {
            if (!e.button)
            {
                mouseEvent = e;
                isClickedPending = true;
                e.preventDefault();
            }
        });
        canvas.addEventListener("mousemove", (e) => mouseEvent = e);
        Scene.setPendingLoad($.SCN_TEST);
        isReady = true;

        canvasDiv.style.display = "none";
    });
}, LISTENER_ONCE);

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

const mainLoop = (timestamp) =>
{
    if (isReady)
    {
        const dt = (timestamp - oldTimestamp) * 0.001;
        Scene.update(dt);
    }

    oldTimestamp = timestamp;
    window.requestAnimationFrame(mainLoop);
};

const init = () =>
{
    // These all depend on gl resources in some way. This function
    // can be used to reinitialize everything in case of lost context
    // https://www.khronos.org/webgl/wiki/HandlingContextLost
    Buffer.init();
    Texture.init();
    Program.init();
    Dialogue.init();
    Renderer.init();
    Camera.init();
};

let isReady = false;
let oldTimestamp = 0;
window.requestAnimationFrame(mainLoop);
