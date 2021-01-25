import * as $ from "../const";
import { gl } from "../dom";
import { Drawable } from "../components/drawable";
import { Debug } from "./debug";
import { drawArraysVao, setProgram } from "./gl-helper";
import { Buffer } from "./buffer";
import { Texture } from "./texture";
import { ProgramData } from "./program-data";
import { SafeMap, SafeSet } from "../utility";
import { Renderbuffer } from "./renderbuffer";
import { Framebuffer } from "./framebuffer";
import { Model } from "./model";
import { Dialogue } from "../dialogue";

export const render = (scene) =>
{
    /*--------------------------------------------------------------------------
        Queue up drawables
    --------------------------------------------------------------------------*/
    for (const [drawable] of scene.all(Drawable))
    {
        if (drawable.isVisible)
        {
            queues.get(drawable.priority).add(drawable);
        }
    }

    /*--------------------------------------------------------------------------
        Prepare framebuffer
    --------------------------------------------------------------------------*/
    Framebuffer.bind();
    Renderbuffer.bindDepth();

    gl.clear($.COLOR_BUFFER_BIT | $.DEPTH_BUFFER_BIT);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    gl.enable($.DEPTH_TEST);
    renderQueue($.RENDER_QUEUE_BACKGROUND);
    gl.disable($.DEPTH_TEST);
    renderQueue($.RENDER_QUEUE_SPRITE);
    renderQueue($.RENDER_QUEUE_UI);

    Renderbuffer.unbind();
    Framebuffer.unbind();

    renderTriangles(imageProgramData, fbTexture, 6);
    renderText();
    renderDebug();

    for (const queue of queues.values())
    {
        queue.clear();
    }
};

const renderDebug = () =>
{
    const programData = Debug.getProgramData();
    setProgram(programData);
    const bufferSize = Buffer.getSize($.BUF_ARR_DEBUG);
    drawArraysVao($.LINES, bufferSize / 3, programData);
};

const renderText = () =>
{
    const textProgramData = Dialogue.getTextProgramData();
    const bubbleProgramData = Dialogue.getBubbleProgramData();

    const textTexture = Dialogue.getTextTexture();
    const bubbleTexture = Dialogue.getBubbleTexture();

    renderTriangles(bubbleProgramData, bubbleTexture, 6);
    renderTriangles(textProgramData, textTexture, 6);

    Texture.unbind();
};

const renderQueue = (queueId) =>
{
    const queue = queues.get(queueId);

    for (const { programData } of queue)
    {
        const texture = Model.getTexture(programData.modelId);
        const drawSize = Model.getDrawSize(programData.modelId);

        renderTriangles(programData, texture, drawSize);
    }
};

const renderTriangles = (programData, texture, drawSize) =>
{
    setProgram(programData);
    Texture.bind(texture);
    programData.setUniforms();
    // TODO: change 6 to vertices size for polygons
    drawArraysVao($.TRIANGLES, drawSize, programData);
};

// Blending
gl.enable($.BLEND);
gl.blendFunc($.SRC_ALPHA, $.ONE_MINUS_SRC_ALPHA);

const imageProgramData = new ProgramData($.PROG_IMAGE);
imageProgramData.setModel($.MODEL_SCREEN);

// Prepare framebuffer
Framebuffer.bind();
Renderbuffer.bindDepth();

const fbTexture = Framebuffer.createTexture();
const rboDepth = Renderbuffer.createDepth();
Framebuffer.attachDepth(rboDepth);

Renderbuffer.unbind();
Framebuffer.unbind();

const queues = new SafeMap([
    [$.RENDER_QUEUE_BACKGROUND, new SafeSet],
    [$.RENDER_QUEUE_SPRITE, new SafeSet()],
    [$.RENDER_QUEUE_UI, new SafeSet()]
]);
