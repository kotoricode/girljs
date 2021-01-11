import * as $ from "../const";
import { gl } from "../dom";
import { Sprite } from "../components/sprite";
import { getModel } from "./model";
import { subscribe } from "../utils/publisher";
import { getDebugProgram } from "./debug";
import {
    depthMask,
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
    const model = getModel($.MODEL_IMAGE);
    const offsets = {
        [$.A_POSITION]: model.meshOffset,
        [$.A_UV]: model.uvOffset
    };

    const programData = new ProgramData($.PROG_VIEW);
    programData.setAttributes($.BUF_ARR_POLYGON, offsets);

    return programData;
};

export const render = (scene) =>
{
    // TODO: queue must be based on scenegraph, not .all()
    for (const [sprite] of scene.all(Sprite))
    {
        if (sprite.isVisible)
        {
            const queue = queues.get(sprite.programData.programId);
            queue.push(sprite);
        }
    }

    // Prepare framebuffer
    gl.bindFramebuffer($.FRAMEBUFFER, framebuffer);

    if (isCanvasResized)
    {
        gl.deleteTexture(framebufferTexture);
        framebufferTexture = Texture.create();
        Texture.bind(framebufferTexture);

        gl.texImage2D(
            $.TEXTURE_2D,
            0,
            $.RGB,
            gl.canvas.width,
            gl.canvas.height,
            0,
            $.RGB,
            $.UNSIGNED_BYTE,
            null
        );

        Texture.setParami($.TEXTURE_MIN_FILTER, $.LINEAR);
        Texture.unbind();

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
    enable($.DEPTH_TEST);
    depthMask(true);

    // Render world to framebuffer
    renderQueue($.PROG_TILED);
    renderQueue($.PROG_SPRITE);

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
    disable($.DEPTH_TEST);
    depthMask(false);

    const programData = getDebugProgram();
    setProgram(programData);

    const bufferSize = BufferArray.getSize($.BUF_ARR_DEBUG);
    drawArraysVao($.LINES, 0, bufferSize / 3, programData.vao);
};

const renderQueue = (queueId) =>
{
    const queue = queues.get(queueId);

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

enable($.BLEND);
gl.blendFunc($.SRC_ALPHA, $.ONE_MINUS_SRC_ALPHA);
disable($.CULL_FACE);

const framebuffer = gl.createFramebuffer();
const viewProgramData = getViewProgramData();
let isCanvasResized = true;
let framebufferTexture;

const queues = new Map([
    [$.PROG_SPRITE, []],
    [$.PROG_TILED, []]
]);
