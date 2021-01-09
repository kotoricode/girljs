import * as $ from "../const";
import { gl } from "../dom";
import { Sprite } from "../components/sprite";
import { createProgramData } from "./program";
import { getModel } from "./model";
import { subscribe } from "../utils/publisher";
import { getViewProjection } from "../math/camera";
import { getDebugProgram } from "./debug";
import { getBufferSize } from "./buffer";
import {
    bindTexture, bindVao, setTextureParami, unbindTexture, unbindVao, useProgram
} from "./gl-helper";

const getViewProgramData = () =>
{
    const model = getModel($.MODEL_IMAGE);
    const offsets = {
        [$.A_POSITION]: model.meshOffset,
        [$.A_UV]: model.uvOffset
    };

    return createProgramData($.PROGRAM_GRAY, offsets, $.BUFFER_MODEL);
};

export const render = (scene) =>
{
    // TODO: queue must be based on scenegraph, not .all()
    for (const [sprite] of scene.all(Sprite))
    {
        if (sprite.isVisible)
        {
            const queue = queues.get(sprite.programId);
            queue.push(sprite);
        }
    }

    // Prepare framebuffer
    gl.bindFramebuffer($.FRAMEBUFFER, framebuffer);

    if (isCanvasResized)
    {
        gl.deleteTexture(framebufferTexture);

        framebufferTexture = gl.createTexture();
        const { width, height } = gl.canvas;

        bindTexture(framebufferTexture);

        gl.texImage2D(
            $.TEXTURE_2D,
            0,
            $.RGB,
            width,
            height,
            0,
            $.RGB,
            $.UNSIGNED_BYTE,
            null
        );

        setTextureParami($.TEXTURE_MIN_FILTER, $.LINEAR);
        unbindTexture();

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
    gl.enable($.DEPTH_TEST);
    gl.depthMask(true);

    // Render world to framebuffer
    renderQueue($.PROGRAM_TILED);
    renderQueue($.PROGRAM_SPRITE);

    // Framebuffer to canvas
    gl.bindFramebuffer($.FRAMEBUFFER, null);
    useProgram(viewProgram);

    bindTexture(framebufferTexture);
    renderTriangleStrip(viewVao);
    unbindTexture();

    // Debug
    renderDebug();
};

const renderDebug = () =>
{
    gl.disable($.DEPTH_TEST);
    gl.depthMask(false);

    const prog = getDebugProgram();

    useProgram(prog.program);

    const vp = getViewProjection();
    prog.uniSetters.get($.U_VIEWPROJECTION)([0, vp]);

    const bufferSize = getBufferSize($.BUFFER_DEBUG);

    bindVao(prog.vao);
    gl.drawArrays($.LINES, 0, bufferSize / 3);
    unbindVao();
};

const renderQueue = (queueId) =>
{
    const queue = queues.get(queueId);

    for (const model of queue)
    {
        const { program, uniValues, uniSetters, vao } = model.programData;
        const { texture } = model;

        useProgram(program);
        bindTexture(texture);

        // TODO: ideally we'd check for unchanged uniforms as well...
        for (const [key, value] of uniValues)
        {
            uniSetters.get(key)(value);
        }

        renderTriangleStrip(vao);
    }

    queue.length = 0;
};

const renderTriangleStrip = (vao) =>
{
    bindVao(vao);
    gl.drawArrays($.TRIANGLE_STRIP, 0, 4);
    unbindVao();
};

const framebuffer = gl.createFramebuffer();

let isCanvasResized = true,
    framebufferTexture;

subscribe($.EVENT_CANVAS_RESIZED, () => isCanvasResized = true);

const { program: viewProgram, vao: viewVao } = getViewProgramData();

gl.enable($.BLEND);
gl.blendFunc($.SRC_ALPHA, $.ONE_MINUS_SRC_ALPHA);

// Sprites turn by flipping scale.x sign, so no face culling
// TODO: maybe do add face culling for static (no Motion component) entities
gl.disable($.CULL_FACE);

const queues = new Map([
    [$.PROGRAM_SPRITE, []],
    [$.PROGRAM_TILED, []]
]);
