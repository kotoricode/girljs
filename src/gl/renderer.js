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
    // TODO: need to queue up by z index for each program
    for (const [drawable] of scene.all(Drawable))
    {
        if (drawable.isVisible)
        {
            const queue = programQueues.get(drawable.programData.programId);
            queue.add(drawable);
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

    renderProgramQueue($.PROG_DEBUG);
    renderProgramQueue($.PROG_POLYGON);
    renderProgramQueue($.PROG_SPRITE);

    gl.disable($.DEPTH_TEST);

    Renderbuffer.unbind();
    Framebuffer.unbind();

    renderTriangles(imageProgramData, fbTexture, 6);
    renderProgramQueue($.PROG_UI);
    renderText();
    renderDebug();

    for (const queue of programQueues.values())
    {
        queue.clear();
    }
};

const renderDebug = () =>
{
    const programData = Debug.getProgramData();
    setProgram(programData);
    const bufferSize = Buffer.getSize($.BUF_ARR_DEBUG);
    drawArraysVao($.LINES, 0, bufferSize / 3, programData);
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

const renderProgramQueue = (programId) =>
{
    const queue = programQueues.get(programId);

    for (const { programData, modelId } of queue)
    {
        const texture = Model.getTexture(modelId);
        const drawSize = Model.getDrawSize(modelId);

        renderTriangles(programData, texture, drawSize);
    }
};

const renderTriangles = (programData, texture, drawSize) =>
{
    setProgram(programData);
    Texture.bind(texture);
    programData.setUniforms();
    // TODO: change 6 to vertices size for polygons
    drawArraysVao($.TRIANGLES, 0, drawSize, programData);
};

// Blending
gl.enable($.BLEND);
gl.blendFunc($.SRC_ALPHA, $.ONE_MINUS_SRC_ALPHA);

const imageProgramData = new ProgramData($.PROG_IMAGE);
imageProgramData.setAttributes($.MODEL_SCREEN);

// Prepare framebuffer
Framebuffer.bind();
Renderbuffer.bindDepth();

const fbTexture = Framebuffer.createTexture();
const rboDepth = Renderbuffer.createDepth();
Framebuffer.attachDepth(rboDepth);

Renderbuffer.unbind();
Framebuffer.unbind();

const programQueues = new SafeMap([
    [$.PROG_DEBUG, new SafeSet()],
    [$.PROG_POLYGON, new SafeSet()],
    [$.PROG_SPRITE, new SafeSet()],
    [$.PROG_UI, new SafeSet()]
]);
