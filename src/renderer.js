import { gl } from "./dom";
import { Drawable } from "./components/drawable";
import { createProgramData } from "./program";
import { getModel } from "./model";
import { subscribe } from "./publisher";

import * as $ from "./const";

const getViewProgramData = () =>
{
    const model = getModel($.MODEL_IMAGE);

    return createProgramData($.PROGRAM_GRAY, {
        [$.A_POSITION]: model.meshOffset,
        [$.A_UV]: model.uvOffset
    });
};

const framebuffer = gl.createFramebuffer();

let isCanvasResized = true,
    framebufferTexture,
    oldTexture,
    oldProgram;

subscribe($.EVENT_RESIZE, () => isCanvasResized = true, false);

const { program: viewProgram, vao: viewVao } = getViewProgramData();

gl.enable($.BLEND);
gl.blendFunc($.SRC_ALPHA, $.ONE_MINUS_SRC_ALPHA);
gl.disable($.CULL_FACE);
gl.disable($.DEPTH_TEST);
gl.depthMask(false);

const queues = new Map([
    [$.PROGRAM_SPRITE, []],
    [$.PROGRAM_TILED, []]
]);

export const render = (scene) =>
{
    for (const [draw] of scene.all(Drawable))
    {
        if (draw.isVisible)
        {
            const queue = queues.get(draw.programId);
            queue.push(draw);
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

    gl.clear($.COLOR_BUFFER_BIT | $.DEPTH_BUFFER_BIT);

    // Render world to framebuffer
    renderQueue($.PROGRAM_TILED);
    renderQueue($.PROGRAM_SPRITE);

    // Framebuffer to canvas
    gl.bindFramebuffer($.FRAMEBUFFER, null);
    gl.useProgram(viewProgram);
    gl.bindTexture($.TEXTURE_2D, framebufferTexture);

    gl.bindVertexArray(viewVao);
    gl.drawArrays($.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);

    gl.bindTexture($.TEXTURE_2D, null);
};

const renderQueue = (queueId) =>
{
    const queue = queues.get(queueId);

    for (const { programData, texture } of queue)
    {
        const { program, uniValues, uniSetters, vao } = programData;

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

        for (const [key, value] of uniValues)
        {
            uniSetters.get(key)(value);
        }

        gl.bindVertexArray(vao);
        gl.drawArrays($.TRIANGLES, 0, 6);
        gl.bindVertexArray(null);
    }

    queue.length = 0;
};
