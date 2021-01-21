import * as $ from "../const";
import { gl } from "../dom";
import { Drawable } from "../components/drawable";
import { Debug } from "./debug";
import { drawArraysVao, setProgram } from "./gl-helper";
import { BufferArray } from "./buffer";
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
            const queue = queues.get(drawable.programData.programId);
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

    renderWorld();

    Renderbuffer.unbind();
    Framebuffer.unbind();

    renderToCanvas(fbTexture);

    renderQueue($.PROG_UI);
    renderText();

    renderDebug();

    for (const queue of queues.values())
    {
        queue.clear();
    }
};

const renderWorld = () =>
{
    gl.enable($.DEPTH_TEST);

    renderQueue($.PROG_POLYGON);
    renderQueue($.PROG_SPRITE);

    gl.disable($.DEPTH_TEST);
};

const renderToCanvas = () =>
{
    setProgram(imageProgramData);
    Texture.bind(fbTexture);
    drawArraysVao($.TRIANGLE_STRIP, 0, 4, imageProgramData);
    Texture.unbind();
};

const renderDebug = () =>
{
    const programData = Debug.getProgramData();
    setProgram(programData);
    const bufferSize = BufferArray.getSize($.BUF_ARR_DEBUG);
    drawArraysVao($.LINES, 0, bufferSize / 3, programData);
};

const renderText = () =>
{
    const programData = Dialogue.getProgramData();
    const texture = Dialogue.getTexture();

    setProgram(programData);
    Texture.bind(texture);
    programData.setUniforms();
    drawArraysVao($.TRIANGLE_STRIP, 0, 4, programData);
    Texture.unbind();
};

const renderQueue = (programId) =>
{
    const queue = queues.get(programId);

    for (const { programData, modelId } of queue)
    {
        const texture = Model.getTexture(modelId);

        setProgram(programData);
        Texture.bind(texture);
        programData.setUniforms();
        drawArraysVao($.TRIANGLE_STRIP, 0, 4, programData);
    }
};

// Blending
gl.enable($.BLEND);
gl.blendFunc($.SRC_ALPHA, $.ONE_MINUS_SRC_ALPHA);

const imageProgramData = new ProgramData($.PROG_IMAGE_FX);
imageProgramData.setAttributes($.MODEL_SCREEN);

// Prepare framebuffer
Framebuffer.bind();
Renderbuffer.bindDepth();

const fbTexture = Framebuffer.createTexture();
const rboDepth = Renderbuffer.createDepth();
Framebuffer.attachDepth(rboDepth);

Renderbuffer.unbind();
Framebuffer.unbind();

const queues = new SafeMap([
    [$.PROG_POLYGON, new SafeSet()],
    [$.PROG_SPRITE, new SafeSet()],
    [$.PROG_UI, new SafeSet()]
]);
