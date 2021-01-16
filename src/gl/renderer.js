import * as $ from "../const";
import { gl } from "../dom";
import { Sprite } from "../components/sprite";
import { Publisher } from "../utils/publisher";
import { getDebugProgram } from "./debug";
import {
    disable,
    drawArraysVao,
    enable,
    setProgram
} from "./gl-helper";

import { BufferArray } from "./buffer";
import { Texture } from "./texture";
import { ProgramData } from "./program-data";
import { SafeMap } from "../utils/better-builtins";

const getViewProgramData = () =>
{
    const programData = new ProgramData($.PROG_VIEW);
    programData.setAttributes($.MODEL_IMAGE);

    return programData;
};

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

    gl.bindFramebuffer($.FRAMEBUFFER, fbo);
    gl.bindRenderbuffer(gl.RENDERBUFFER, rboDepth);

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
    enable($.DEPTH_TEST);

    for (const queue of queues.values())
    {
        renderQueue(queue);
    }

    gl.bindFramebuffer($.FRAMEBUFFER, null);
    gl.bindRenderbuffer($.RENDERBUFFER, null);

    // Transfer to canvas
    disable($.DEPTH_TEST);
    setProgram(viewProgramData);
    Texture.bind(fbTexture);
    renderTriangle(viewProgramData.vao);
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
        renderTriangleStrip(programData.vao);
    }

    queue.length = 0;
};

const renderTriangleStrip = (vao) =>
{
    drawArraysVao($.TRIANGLE_STRIP, 0, 4, vao);
};

const renderTriangle = (vao) =>
{
    drawArraysVao($.TRIANGLES, 0, 6, vao);
};

Publisher.subscribe($.EVENT_RESIZED, () => isCanvasResized = true);

enable($.BLEND);
gl.blendFunc($.SRC_ALPHA, $.ONE_MINUS_SRC_ALPHA);

const fbo = gl.createFramebuffer();
const viewProgramData = getViewProgramData();
let isCanvasResized = true;
let fbTexture;

const rboDepth = gl.createRenderbuffer();

// Queues are ordered
const queues = new SafeMap([
    [$.PROG_POLYGON, []],
    [$.PROG_SPRITE, []],
]);
