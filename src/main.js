import * as $ from "./const";
import { Vector } from "./math/vector";
import { getElement, LISTENER_ONCE } from "./utility";

import { Buffer } from "./gl/buffer";
import { Texture } from "./gl/texture";
import { Program } from "./gl/program";
import { Renderer } from "./gl/renderer";
import { Camera } from "./camera";
import { Ui } from "./ui";

import { Scene } from "./scene";
import { Model } from "./gl/model";
import { AudioPlayer } from "./audio-player";

const canvasDiv = getElement("canvasDiv");
canvasDiv.innerText = $.DOM_CLICK_TO_START;

canvasDiv.addEventListener("mousedown", async() =>
{
    canvasDiv.innerText = $.DOM_LOADING;
    AudioPlayer.init();
    init();

    if (!Model.isLoaded())
    {
        await Model.load();
    }

    canvas.addEventListener("mousedown", (e) =>
    {
        if (!e.button)
        {
            mouseEvent = e;
            isMouseDownPending = true;
            e.preventDefault();
        }
    });

    canvas.addEventListener("mouseup", (e) =>
    {
        if (!e.button)
        {
            isMouseUpPending = true;
            e.preventDefault();
        }
    });

    canvas.addEventListener("mousemove", (e) => mouseEvent = e);

    Scene.setPendingLoad($.SCN_TEST);
    isReady = true;

    canvasDiv.style.display = "none";
}, LISTENER_ONCE);

/*------------------------------------------------------------------------------
    Mouse
------------------------------------------------------------------------------*/
export const Mouse = {
    consume()
    {
        isMouseConsumed = true;
    },
    getClip()
    {
        return mouseClip;
    },
    isClick()
    {
        return !isMouseConsumed && mouseState === MOUSE_STATE_CLICK;
    },
    isDown()
    {
        return !isMouseConsumed && mouseState === MOUSE_STATE_DOWN;
    },
    update()
    {
        isMouseConsumed = false;

        if (isMouseUpPending)
        {
            mouseState = MOUSE_STATE_NONE;
            isMouseUpPending = false;
        }
        else if (mouseState === MOUSE_STATE_CLICK)
        {
            mouseState = MOUSE_STATE_DOWN;
        }

        if (mouseEvent)
        {
            const x = (mouseEvent.clientX-canvasRect.left) / canvas.clientWidth;
            const y = (mouseEvent.clientY-canvasRect.top) / canvas.clientHeight;

            mouseClip.x = 2 * x - 1;
            mouseClip.y = 1 - 2 * y;
            mouseEvent = null;

            if (isMouseDownPending)
            {
                mouseState = MOUSE_STATE_CLICK;
                isMouseDownPending = false;
            }
        }
    },
};

let isMouseDownPending = false;
let isMouseUpPending = false;

const mouseClip = new Vector();
let mouseEvent;
let isMouseConsumed = false;

const MOUSE_STATE_NONE = 0;
const MOUSE_STATE_CLICK = 1;
const MOUSE_STATE_DOWN = 2;
let mouseState = MOUSE_STATE_NONE;

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
    Ui.init();
    Renderer.init();
    Camera.init();
};

let isReady = false;
let oldTimestamp = 0;
window.requestAnimationFrame(mainLoop);
