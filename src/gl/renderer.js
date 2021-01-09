import * as $ from "../const";
import { gl } from "../dom";
import { Sprite } from "../components/sprite";
import { createProgramData } from "./program";
import { getModel } from "./model";
import { subscribe } from "../utils/publisher";
import { getViewProjection } from "../math/camera";
import { getDebugProgram } from "./debug";
import { getBufferSize } from "./buffer";

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

        gl.bindTexture($.TEXTURE_2D, framebufferTexture);

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

        gl.texParameteri($.TEXTURE_2D, $.TEXTURE_MIN_FILTER, $.LINEAR);
        gl.bindTexture($.TEXTURE_2D, null);

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
    gl.useProgram(viewProgram);

    gl.bindTexture($.TEXTURE_2D, framebufferTexture);
    renderTriangleStrip(viewVao);
    gl.bindTexture($.TEXTURE_2D, null);

    // Debug
    renderDebug();
};

const renderDebug = () =>
{
    gl.disable($.DEPTH_TEST);
    gl.depthMask(false);

    const prog = getDebugProgram();

    oldProgram = prog.program;
    gl.useProgram(oldProgram);

    const vp = getViewProjection();
    prog.uniSetters.get($.U_VIEWPROJECTION)([0, vp]);

    const bufferSize = getBufferSize($.BUFFER_DEBUG);

    gl.bindVertexArray(prog.vao);
    gl.drawArrays($.LINES, 0, bufferSize / 3);
    gl.bindVertexArray(null);
};

const renderQueue = (queueId) =>
{
    const queue = queues.get(queueId);

    for (const model of queue)
    {
        const { program, uniValues, uniSetters, vao } = model.programData;
        const { texture } = model;

        if (oldProgram !== program)
        {
            gl.useProgram(program);
            oldProgram = program;
        }

        if (oldTexture !== texture)
        {
            gl.bindTexture($.TEXTURE_2D, texture);
            oldTexture = texture;
        }

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
    gl.bindVertexArray(vao);
    gl.drawArrays($.TRIANGLE_STRIP, 0, 4);
    gl.bindVertexArray(null);
};

const framebuffer = gl.createFramebuffer();

let isCanvasResized = true,
    framebufferTexture,
    oldTexture,
    oldProgram;

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
