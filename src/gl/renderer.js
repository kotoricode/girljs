import * as $ from "../const";
import { gl } from "../dom";
import { Sprite } from "../components/sprite";
import { getModel } from "./model";
import { subscribe } from "../utils/publisher";
import { getDebugProgram } from "./debug";
import {
    bindTexture,
    createTexture,
    depthMask,
    disable,
    drawArraysVao,
    enable,
    getBufferSize,
    setTextureParami,
    bindUniformBlock,
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

    const programData = new ProgramData($.PROGRAM_VIEW);
    programData.setAttributes($.ARRAY_BUFFER_POLYGON, offsets);

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
        framebufferTexture = createTexture();
        bindTexture(framebufferTexture);

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
    enable($.DEPTH_TEST);
    depthMask(true);

    // Render world to framebuffer
    renderQueue($.PROGRAM_TILED);
    renderQueue($.PROGRAM_SPRITE);

    // Framebuffer to canvas
    gl.bindFramebuffer($.FRAMEBUFFER, null);
    useProgram(viewProgramData.program);

    bindTexture(framebufferTexture);
    renderTriangle(viewProgramData.vao);
    unbindTexture();

    // Debug
    renderDebug();
};

const renderDebug = () =>
{
    disable($.DEPTH_TEST);
    depthMask(false);

    const { program, vao } = getDebugProgram();
    useProgram(program);

    bindUniformBlock(program, $.UNIFORM_BUFFER_CAMERA, $.UB_CAMERA);
    const bufferSize = getBufferSize($.ARRAY_BUFFER_DEBUG);
    drawArraysVao($.LINES, 0, bufferSize / 3, vao);
};

const renderQueue = (queueId) =>
{
    const queue = queues.get(queueId);

    for (const { programData, texture } of queue)
    {
        const { program } = programData;

        useProgram(program);
        bindUniformBlock(program, $.UNIFORM_BUFFER_CAMERA, $.UB_CAMERA);

        bindTexture(texture);
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

subscribe($.EVENT_CANVAS_RESIZED, () => isCanvasResized = true);

enable($.BLEND);
gl.blendFunc($.SRC_ALPHA, $.ONE_MINUS_SRC_ALPHA);
disable($.CULL_FACE);

const framebuffer = gl.createFramebuffer();
const viewProgramData = getViewProgramData();
let isCanvasResized = true;
let framebufferTexture;

const queues = new Map([
    [$.PROGRAM_SPRITE, []],
    [$.PROGRAM_TILED, []]
]);
