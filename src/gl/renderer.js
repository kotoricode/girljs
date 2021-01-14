import * as $ from "../const";
import { gl } from "../dom";
import { Sprite } from "../components/sprite";
import { getModel } from "./model";
import { subscribe } from "../utils/publisher";
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

const getViewProgramData = () =>
{
    const { xyzOffset, uvOffset } = getModel($.MODEL_IMAGE);

    const offsets = {
        [$.A_POSITION]: xyzOffset,
        [$.A_UV]: uvOffset
    };

    const programData = new ProgramData($.PROG_VIEW);
    programData.setAttributes($.BUF_ARR_POLYGON, offsets);

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
            // TODO: sort by z-position
        }
    }

    // Prepare framebuffer
    gl.bindFramebuffer($.FRAMEBUFFER, framebuffer);

    if (isCanvasResized)
    {
        gl.deleteTexture(framebufferTexture);
        framebufferTexture = Texture.createFramebufferTexture();

        gl.framebufferTexture2D(
            $.FRAMEBUFFER,
            $.COLOR_ATTACHMENT0,
            $.TEXTURE_2D,
            framebufferTexture,
            0
        );

        isCanvasResized = false;
    }

    gl.clear($.COLOR_BUFFER_BIT);

    // Render world to framebuffer
    for (const queue of queues.values())
    {
        renderQueue(queue);
    }

    // Framebuffer to canvas
    gl.bindFramebuffer($.FRAMEBUFFER, null);
    setProgram(viewProgramData);

    Texture.bind(framebufferTexture);
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

subscribe($.EVENT_RESIZED, () => isCanvasResized = true);

disable($.DEPTH_TEST);
disable($.CULL_FACE);
enable($.BLEND);
gl.blendFunc($.SRC_ALPHA, $.ONE_MINUS_SRC_ALPHA);

const framebuffer = gl.createFramebuffer();
const viewProgramData = getViewProgramData();
let isCanvasResized = true;
let framebufferTexture;

// Queues are ordered
const queues = new Map([
    [$.PROG_POLYGON, []],
    [$.PROG_SPRITE, []],
]);
