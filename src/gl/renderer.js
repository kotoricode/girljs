import * as $ from "../const";
import { gl } from "../dom";
import { Drawable } from "../components/drawable";
import { Texture } from "./texture";
import { Program } from "./program";
import { SafeMap, SafeSet } from "../utility";
import { Dialogue } from "../dialogue";
import { Scene } from "../scene";
import { Buffer } from "./buffer";
import { HitBox } from "../components/hitbox";

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

const setDebug = () =>
{
    const debugMesh = debugProgram.getMesh();

    let idx = 0;
    for (const [hitbox] of Scene.all(HitBox))
    {
        const { x: minX, y: minY, z: minZ } = hitbox.min;
        const { x: maxX, y: maxY, z: maxZ } = hitbox.max;

        debugMesh.setValuesAtIndex(idx,
            minX, minY, minZ,
            maxX, minY, minZ,
            maxX, minY, minZ,
            maxX, minY, maxZ,
            maxX, minY, maxZ,
            minX, minY, maxZ,
            minX, minY, maxZ,
            minX, minY, minZ,
            minX, maxY, minZ,
            maxX, maxY, minZ,
            maxX, maxY, minZ,
            maxX, maxY, maxZ,
            maxX, maxY, maxZ,
            minX, maxY, maxZ,
            minX, maxY, maxZ,
            minX, maxY, minZ,
            minX, minY, minZ,
            minX, maxY, minZ,
            maxX, minY, minZ,
            maxX, maxY, minZ,
            minX, minY, maxZ,
            minX, maxY, maxZ,
            maxX, minY, maxZ,
            maxX, maxY, maxZ,
        );

        idx += 72;
    }

    Buffer.setData($.BUF_ARR_DEBUG, debugMesh);
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

    setDebug();

    bindFb();

    gl.clear($.COLOR_BUFFER_BIT | $.DEPTH_BUFFER_BIT);
    gl.clearColor(0.6, 0.6, 0.6, 1.0);

    gl.enable($.DEPTH_TEST);
    gl.enable($.CULL_FACE);
    drawQueue($.QUE_BACKGROUND);

    gl.disable($.DEPTH_TEST);
    gl.disable($.CULL_FACE);
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

    if (program.isTextured())
    {
        const texture = program.getTexture();
        Texture.bind(texture);
    }

    if (program.hasUniforms())
    {
        program.setUniforms();
    }

    const { drawMode, drawSize } = program.model;

    program.bindVao();
    gl.drawArrays(drawMode, 0, drawSize);
    program.unbindVao();
};

/*------------------------------------------------------------------------------
    Init
------------------------------------------------------------------------------*/
gl.enable($.BLEND);
gl.blendFunc($.SRC_ALPHA, $.ONE_MINUS_SRC_ALPHA);

const debugProgram = new Program($.PRG_COLOR, $.MDL_DEBUG);

const uiPrograms = new SafeSet([
    new Program($.PRG_IMAGE, $.MDL_FB),
    Dialogue.getBubbleProgram(),
    Dialogue.getTextProgram(),
    debugProgram
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
