import { gl } from "./dom";
import { Drawable } from "./components/drawable";
import { createProgramData } from "./program";
import { getModel } from "./model";
import { subscribe } from "./publisher";

import * as CONST from "./const";
import * as ENUM_GL from "./enum-gl";

const createFramebufferTexture = () =>
{
    const texture = gl.createTexture();

    gl.bindTexture(ENUM_GL.TEXTURE_2D, texture);

    gl.texImage2D(
        ENUM_GL.TEXTURE_2D,
        0,
        ENUM_GL.RGB,
        gl.canvas.width,
        gl.canvas.height,
        0,
        ENUM_GL.RGB,
        ENUM_GL.UNSIGNED_BYTE,
        null
    );

    gl.texParameteri(
        ENUM_GL.TEXTURE_2D,
        ENUM_GL.TEXTURE_MIN_FILTER,
        ENUM_GL.LINEAR
    );

    gl.bindTexture(ENUM_GL.TEXTURE_2D, null);

    return texture;
};

const getViewProgramData = () =>
{
    const model = getModel(CONST.MODEL_IMAGE);

    return createProgramData(CONST.PROGRAM_GRAY, {
        [CONST.A_POS]: model.meshOffset,
        [CONST.A_UV]: model.uvOffset
    });
};

const framebuffer = gl.createFramebuffer();
let framebufferTexture = createFramebufferTexture();

let isCanvasResized;
subscribe(CONST.EVENT_RESIZE, () => isCanvasResized = true);

const view = getViewProgramData();

gl.enable(ENUM_GL.BLEND);
gl.blendFunc(ENUM_GL.SRC_ALPHA, ENUM_GL.ONE_MINUS_SRC_ALPHA);

const queues = new Map([
    [CONST.PROGRAM_SPRITE, []],
    [CONST.PROGRAM_TILED, []]
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
    gl.bindFramebuffer(ENUM_GL.FRAMEBUFFER, framebuffer);

    if (isCanvasResized)
    {
        gl.deleteTexture(framebufferTexture);
        framebufferTexture = createFramebufferTexture();

        gl.framebufferTexture2D(
            ENUM_GL.FRAMEBUFFER,
            ENUM_GL.COLOR_ATTACHMENT0,
            ENUM_GL.TEXTURE_2D,
            framebufferTexture,
            0
        );

        isCanvasResized = false;
    }

    gl.clear(ENUM_GL.COLOR_BUFFER_BIT | ENUM_GL.DEPTH_BUFFER_BIT);

    // 3D Queue
    gl.enable(ENUM_GL.CULL_FACE);
    gl.enable(ENUM_GL.DEPTH_TEST);
    gl.depthMask(true);
    renderQueue(CONST.PROGRAM_TILED);

    // Sprite Queue
    gl.disable(ENUM_GL.CULL_FACE);
    gl.disable(ENUM_GL.DEPTH_TEST);
    gl.depthMask(false);
    renderQueue(CONST.PROGRAM_SPRITE);

    // Framebuffer to canvas
    gl.bindFramebuffer(ENUM_GL.FRAMEBUFFER, null);
    gl.useProgram(view.program);
    gl.bindTexture(ENUM_GL.TEXTURE_2D, framebufferTexture);

    gl.bindVertexArray(view.vao);
    gl.drawArrays(ENUM_GL.TRIANGLES, 0, 6);
    gl.bindVertexArray(null);

    gl.bindTexture(ENUM_GL.TEXTURE_2D, null);
};

const renderQueue = (queueId) =>
{
    const queue = queues.get(queueId);

    let oldTexture, oldProgram;

    for (const { programData, texture, model } of queue)
    {
        const { program, uniforms, uniSetters, vao } = programData;

        if (oldProgram !== program)
        {
            gl.useProgram(program);
            oldProgram = program;
        }

        if (oldTexture !== texture)
        {
            gl.bindTexture(ENUM_GL.TEXTURE_2D, texture);
            oldTexture = texture;
        }

        for (const [key, value] of uniforms)
        {
            uniSetters.get(key)(value);
        }

        gl.bindVertexArray(vao);
        gl.drawArrays(ENUM_GL.TRIANGLES, 0, model.numVertices);
        gl.bindVertexArray(null);
    }

    queue.length = 0;
};
