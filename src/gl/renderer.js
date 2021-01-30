import * as $ from "../const";
import { gl } from "../dom";
import { Drawable } from "../components/drawable";
import { Debug } from "./debug";
import { Texture } from "./texture";
import { Program } from "./program";
import { SafeMap, SafeSet } from "../utility";
import { Model } from "./model";
import { Dialogue } from "../dialogue";
import { Scene } from "../scene";

const bindFb = () =>
{
    gl.bindFramebuffer($.FRAMEBUFFER, fbo);
    gl.bindRenderbuffer($.RENDERBUFFER, rboDepth);
};

const unbindFb = () =>
{
    gl.bindRenderbuffer($.RENDERBUFFER, null);
    gl.bindFramebuffer($.FRAMEBUFFER, null);
};

export const render = () =>
{
    for (const [drawable] of Scene.all(Drawable))
    {
        if (drawable.isVisible)
        {
            queues.get(drawable.priority).add(drawable);
        }
    }

    bindFb();

    gl.clear($.COLOR_BUFFER_BIT | $.DEPTH_BUFFER_BIT);
    gl.clearColor(0.6, 0.6, 0.6, 1.0);

    gl.enable($.DEPTH_TEST);
    drawQueue($.QUE_BACKGROUND);

    gl.disable($.DEPTH_TEST);
    drawQueue($.QUE_SPRITE);
    drawQueue($.QUE_UI);

    unbindFb();

    for (const program of uiPrograms)
    {
        draw(program);
    }

    for (const queue of queues.values())
    {
        queue.clear();
    }
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
    program.activate();

    if (Model.isTextured(program.modelId))
    {
        const texture = Model.getTexture(program.modelId);
        Texture.bind(texture);
    }

    if (program.hasUniforms())
    {
        program.setUniforms();
    }

    const drawMode = Model.getDrawMode(program.modelId);
    const drawSize = Model.getDrawSize(program.modelId);

    program.bindVao();
    gl.drawArrays(drawMode, 0, drawSize);
    program.unbindVao();
};

/*------------------------------------------------------------------------------
    Init
------------------------------------------------------------------------------*/
gl.disable($.CULL_FACE);
gl.enable($.BLEND);
gl.blendFunc($.SRC_ALPHA, $.ONE_MINUS_SRC_ALPHA);

const uiPrograms = new SafeSet([
    new Program($.PRG_IMAGE, $.MDL_FB),
    Dialogue.getBubbleProgram(),
    Dialogue.getTextProgram(),
    Debug.getProgram()
]);

const queues = new SafeMap([
    [$.QUE_BACKGROUND, new SafeSet()],
    [$.QUE_SPRITE, new SafeSet()],
    [$.QUE_UI, new SafeSet()]
]);

/*------------------------------------------------------------------------------
    Framebuffer
------------------------------------------------------------------------------*/
const fbo = gl.createFramebuffer();
const rboDepth = gl.createRenderbuffer();
const fbTexture = Texture.get($.TEX_FB);

bindFb();

gl.framebufferTexture2D(
    $.FRAMEBUFFER,
    $.COLOR_ATTACHMENT0,
    $.TEXTURE_2D,
    fbTexture,
    0
);

gl.renderbufferStorage(
    $.RENDERBUFFER,
    $.DEPTH_COMPONENT16,
    gl.canvas.width,
    gl.canvas.height
);

gl.framebufferRenderbuffer(
    $.FRAMEBUFFER,
    $.DEPTH_ATTACHMENT,
    $.RENDERBUFFER,
    rboDepth
);

unbindFb();
