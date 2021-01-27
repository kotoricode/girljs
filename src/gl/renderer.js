import * as $ from "../const";
import { gl } from "../dom";
import { Drawable } from "../components/drawable";
import { Debug } from "./debug";
import { VertexArray } from "./vertex-array";
import { Texture } from "./texture";
import { Program } from "./program";
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

    draw(imageProgram);
    renderText();
    renderDebug();

    for (const queue of queues.values())
    {
        queue.clear();
    }
};

const renderDebug = () =>
{
    const program = Debug.getProgram();
    program.activate();
    const drawSize = Model.getDrawSize(program.modelId);

    drawArraysVao($.LINES, drawSize, program);
};

const renderText = () =>
{
    const textProgram = Dialogue.getTextProgram();
    const bubbleProgram = Dialogue.getBubbleProgram();

    draw(bubbleProgram);
    draw(textProgram);
};

const drawQueue = (queueId) =>
{
    const queue = queues.get(queueId);

    for (const drawable of queue)
    {
        draw(drawable.program);
    }
};

const draw = (program) =>
{
    const texture = Model.getTexture(program.modelId);
    const drawSize = Model.getDrawSize(program.modelId);

    program.activate();
    Texture.bind(texture);
    program.setUniforms();
    drawArraysVao($.TRIANGLES, drawSize, program);
};

const drawArraysVao = (mode, drawSize, program) =>
{
    VertexArray.bind(program.vao);
    gl.drawArrays(mode, 0, drawSize);
    VertexArray.unbind();
};

gl.disable($.CULL_FACE);

// Blending
gl.enable($.BLEND);
gl.blendFunc($.SRC_ALPHA, $.ONE_MINUS_SRC_ALPHA);

const imageProgram = new Program($.PRO_IMAGE, $.MOD_FB);

Framebuffer.prepare();

const queues = new SafeMap([
    [$.QUE_BACKGROUND, new SafeSet()],
    [$.QUE_SPRITE, new SafeSet()],
    [$.QUE_UI, new SafeSet()]
]);
