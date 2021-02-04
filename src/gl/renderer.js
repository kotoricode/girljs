import * as $ from "../const";
import { gl, Mouse } from "../dom";
import { Drawable } from "../components/drawable";
import { Texture } from "./texture";
import { Program } from "./program";
import { SafeMap, SafeSet } from "../utility";
import { Dialogue } from "../dialogue";
import { Scene } from "../scene";
import { Buffer } from "./buffer";
import { HitBox } from "../components/hitbox";
import { Matrix } from "../math/matrix";
import { Ground } from "../components/ground";
import { Camera } from "../camera";

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

const debugGround = () =>
{
    const debugMesh = debugProgram.getMesh();
    const [ground] = Scene.one($.ENT_GROUND, Ground);

    let i = 0;

    for (; i < ground.segments.length; i++)
    {
        const segment = ground.segments[i];
        const nextSegment = ground.segments[(i+1) % ground.segments.length];

        debugMesh.setValuesAtIndex(i * 6,
            segment.x, segment.y, segment.z,
            nextSegment.x, nextSegment.y, nextSegment.z
        );
    }

    const ray = Camera.getRay();

    ray.fromMouse(
        Camera.getInvViewProjection(),
        Mouse.clip
    );

    debugMesh.setValuesAtIndex(i * 6,
        ...ray.start,
        0, 0, 0
    );

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

    //setDebug();
    debugGround();

    bindFb();

    gl.clear($.COLOR_BUFFER_BIT | $.DEPTH_BUFFER_BIT);
    gl.clearColor(0.15, 0.15, 0.15, 1);

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

    program.setUniforms();

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

const imageProgram = new Program($.PRG_IMAGE, $.MDL_FB);
const debugProgram = new Program($.PRG_DEBUG, $.MDL_DEBUG);

imageProgram.stageUniformAtIndex($.U_TRANSFORM, 1, Matrix.identity());

const uiPrograms = new SafeSet([
    imageProgram,
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
