import * as $ from "../const";
import { gl } from "../dom";
import { Drawable } from "../components/drawable";
import { getDebugProgramData } from "./debug";
import { drawArraysVao, setProgram } from "./gl-helper";
import { BufferArray } from "./buffer";
import { Texture } from "./texture";
import { ProgramData } from "./program-data";
import { SafeMap, Publisher, SafeSet } from "../utility";
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

    let fbTexture;

    if (isCanvasResized)
    {
        fbTexture = Framebuffer.createTexture();
        const rboDepth = Renderbuffer.createDepth();
        Framebuffer.attachDepth(rboDepth);

        isCanvasResized = false;
    }
    else
    {
        fbTexture = Framebuffer.getTexture();
    }

    gl.clear($.COLOR_BUFFER_BIT | $.DEPTH_BUFFER_BIT);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);

    renderWorld();

    Renderbuffer.unbind();
    Framebuffer.unbind();

    renderToCanvas(fbTexture);

    renderQueue($.PROG_SCREEN2);
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

const renderToCanvas = (fbTexture) =>
{
    setProgram(viewProgramData);
    Texture.bind(fbTexture);
    drawArraysVao($.TRIANGLES, 0, 6, viewProgramData.vao);
    Texture.unbind();
};

const renderDebug = () =>
{
    const programData = getDebugProgramData();
    setProgram(programData);
    const bufferSize = BufferArray.getSize($.BUF_ARR_DEBUG);
    drawArraysVao($.LINES, 0, bufferSize / 3, programData.vao);
};

const renderText = () =>
{
    const programData = Dialogue.getProgramData();
    const texture = Dialogue.getTexture();

    setProgram(programData);
    Texture.bind(texture);
    drawArraysVao($.TRIANGLES, 0, 6, programData.vao);
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
        drawArraysVao($.TRIANGLE_STRIP, 0, 4, programData.vao);
    }
};

Publisher.subscribe($.EVENT_RESIZED, () => isCanvasResized = true);

// Blending
gl.enable($.BLEND);
gl.blendFunc($.SRC_ALPHA, $.ONE_MINUS_SRC_ALPHA);

const viewProgramData = new ProgramData($.PROG_VIEW);
viewProgramData.setAttributes($.MODEL_SCREEN);
let isCanvasResized = true;

const queues = new SafeMap([
    [$.PROG_POLYGON, new SafeSet()],
    [$.PROG_SPRITE, new SafeSet()],
    [$.PROG_SCREEN2, new SafeSet()]
]);
