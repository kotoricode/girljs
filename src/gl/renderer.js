import * as $ from "../const";
import { gl } from "../dom";
import { Sprite } from "../components/sprite";
import { getModel } from "./model";
import { subscribe } from "../utils/publisher";
import { getViewProjection } from "../math/camera";
import { getDebugProgram } from "./debug";
import {
    bindTexture,
    createTexture,
    drawArraysVao,
    getBufferSize,
    setTextureParami,
    unbindTexture,
    useProgram
} from "./gl-helper";
import { ProgramData } from "./program-data";

const getViewProgramData = () =>
{
    const model = getModel($.MODEL_IMAGE);
    const offsets = {
        [$.A_POSITION]: model.meshOffset,
        [$.A_UV]: model.uvOffset
    };

    const programData = new ProgramData($.PROGRAM_GRAY);
    programData.setAttributes($.BUFFER_POLYGON, offsets);

    return programData;
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

        framebufferTexture = createTexture();
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
    renderTriangle(viewVao);
    //renderTriangleStrip(viewVao);
    unbindTexture();

    // Debug
    renderDebug();
};

const renderDebug = () =>
{
    gl.disable($.DEPTH_TEST);
    gl.depthMask(false);

    const programData = getDebugProgram();

    useProgram(programData.program);

    const vp = getViewProjection();
    programData.updateProgramUniform($.U_VIEWPROJECTION, [0, vp]);

    const bufferSize = getBufferSize($.BUFFER_DEBUG);

    drawArraysVao($.LINES, 0, bufferSize / 3, programData.vao);
};

const renderQueue = (queueId) =>
{
    const queue = queues.get(queueId);

    for (const { programData, texture } of queue)
    {
        useProgram(programData.program);
        bindTexture(texture);
        programData.updateProgramUniforms();
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
