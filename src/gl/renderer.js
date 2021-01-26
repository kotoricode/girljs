import * as $ from "../const";
import { gl } from "../dom";
import { Drawable } from "../components/drawable";
import { Debug } from "./debug";
import { drawArraysVao, setProgram } from "./gl-helper";
import { Texture } from "./texture";
import { ProgramData } from "./program-data";
import { SafeMap, SafeSet } from "../utility";
import { Framebuffer } from "./framebuffer";
import { Model } from "./model";
import { Dialogue } from "../dialogue";
import { Scene } from "../scene";

export const render = () =>
{
    for (const [drawable] of Scene.all(Drawable))
    {
        if (drawable.isVisible)
        {
            queues.get(drawable.priority).add(drawable);
        }
    }

    Framebuffer.bind();

    gl.clear($.COLOR_BUFFER_BIT | $.DEPTH_BUFFER_BIT);
    gl.clearColor(0.6, 0.6, 0.6, 1.0);

    gl.enable($.DEPTH_TEST);
    drawQueue($.QUE_BACKGROUND);

    gl.disable($.DEPTH_TEST);
    drawQueue($.QUE_SPRITE);
    drawQueue($.QUE_UI);

    Framebuffer.unbind();

    draw(imageProgramData);
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
    const drawSize = Model.getDrawSize(programData.modelId);

    drawArraysVao($.LINES, drawSize, programData);
};

const renderText = () =>
{
    const textProgramData = Dialogue.getTextProgramData();
    const bubbleProgramData = Dialogue.getBubbleProgramData();

    draw(bubbleProgramData);
    draw(textProgramData);
};

const drawQueue = (queueId) =>
{
    const queue = queues.get(queueId);

    for (const { programData } of queue)
    {
        draw(programData);
    }
};

const draw = (programData) =>
{
    const texture = Model.getTexture(programData.modelId);
    const drawSize = Model.getDrawSize(programData.modelId);

    setProgram(programData);
    Texture.bind(texture);
    programData.setUniforms();
    drawArraysVao($.TRIANGLES, drawSize, programData);
};

gl.disable($.CULL_FACE);

// Blending
gl.enable($.BLEND);
gl.blendFunc($.SRC_ALPHA, $.ONE_MINUS_SRC_ALPHA);

const imageProgramData = new ProgramData($.PRO_IMAGE, $.MOD_FB);

Framebuffer.prepare();

const queues = new SafeMap([
    [$.QUE_BACKGROUND, new SafeSet()],
    [$.QUE_SPRITE, new SafeSet()],
    [$.QUE_UI, new SafeSet()]
]);
