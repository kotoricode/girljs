import * as $ from "../const";
import { gl } from "../dom";
import { Sprite } from "../components/sprite";
import { Publisher } from "../utils/publisher";
import { getDebugProgram } from "./debug";
import { drawArraysVao, setProgram } from "./gl-helper";
import { BufferArray } from "./buffer";
import { Texture } from "./texture";
import { ProgramData } from "./program-data";
import { SafeMap } from "../utils/better-builtins";
import { Rbo } from "./rbo";
import { Fbo } from "./fbo";

export const render = (scene) =>
{
    for (const [sprite] of scene.all(Sprite))
    {
        if (sprite.isVisible)
        {
            const queue = queues.get(sprite.programData.programId);
            queue.push(sprite);
        }
    }

    Fbo.bind(fbo);
    Rbo.bind(rboDepth);

    if (isCanvasResized)
    {
        const { width, height } = gl.canvas;

        gl.deleteTexture(fbTexture);
        fbTexture = Texture.createFramebufferTexture(width, height);

        gl.framebufferTexture2D(
            $.FRAMEBUFFER,
            $.COLOR_ATTACHMENT0,
            $.TEXTURE_2D,
            fbTexture,
            0
        );

        gl.renderbufferStorage(
            $.RENDERBUFFER,
            $.DEPTH_COMPONENT16,
            width,
            height
        );

        gl.framebufferRenderbuffer(
            $.FRAMEBUFFER,
            $.DEPTH_ATTACHMENT,
            $.RENDERBUFFER,
            rboDepth
        );

        isCanvasResized = false;
    }

    // Draw world
    gl.clear($.COLOR_BUFFER_BIT | $.DEPTH_BUFFER_BIT);
    gl.enable($.DEPTH_TEST);

    for (const queue of queues.values())
    {
        renderQueue(queue);
    }

    Rbo.unbind();
    Fbo.unbind();
    gl.disable($.DEPTH_TEST);

    // Transfer to canvas
    setProgram(viewProgramData);
    Texture.bind(fbTexture);
    drawArraysVao($.TRIANGLES, 0, 6, viewProgramData.vao);
    Texture.unbind();

    // Debug
    renderDebug();
};

const renderDebug = () =>
{
    const programData = getDebugProgram();
    setProgram(programData);

    const bufferSize = BufferArray.getSize($.BUF_ARR_DEBUG);
    drawArraysVao($.LINES, 0, bufferSize / 3, programData.vao);
};

const renderQueue = (queue) =>
{
    for (const { programData, texture } of queue)
    {
        setProgram(programData);
        Texture.bind(texture);
        programData.setUniforms();
        drawArraysVao($.TRIANGLE_STRIP, 0, 4, programData.vao);
    }

    queue.length = 0;
};

Publisher.subscribe($.EVENT_RESIZED, () => isCanvasResized = true);

// Blending
gl.enable($.BLEND);
gl.blendFunc($.SRC_ALPHA, $.ONE_MINUS_SRC_ALPHA);

// Buffers
const fbo = gl.createFramebuffer();
const rboDepth = gl.createRenderbuffer();

const viewProgramData = new ProgramData($.PROG_VIEW);
viewProgramData.setAttributes($.MODEL_IMAGE);
let isCanvasResized = true;
let fbTexture;

// Queues are ordered
const queues = new SafeMap([
    [$.PROG_POLYGON, []],
    [$.PROG_SPRITE, []],
]);
