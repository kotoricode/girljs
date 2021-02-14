import * as $ from "../const";
import { gl } from "../dom";

import { SafeMap, SafeSet } from "../utility";
import { Matrix } from "../math/matrix";

import { Vao } from "./vao";
import { Buffer } from "./buffer";
import { Texture } from "./texture";
import { ShaderProgram } from "./shader-program";

import { Drawable } from "../components/drawable";
import { Ground } from "../components/ground";

import { Dialogue } from "../dialogue";
import { Scene } from "../scene";

export const Renderer = {
    init()
    {
        gl.enable($.BLEND);
        gl.blendFunc($.SRC_ALPHA, $.ONE_MINUS_SRC_ALPHA);

        const imageProgram = new ShaderProgram($.PRG_IMAGE, $.MDL_FB);
        debugProgram = new ShaderProgram($.PRG_DEBUG, $.MDL_DEBUG);

        imageProgram.stageUniformAtIndex($.U_TRANSFORM, 1, Matrix.identity());

        uiPrograms.clear();

        uiPrograms.add(imageProgram);
        uiPrograms.add(Dialogue.getBubbleProgram());
        uiPrograms.add(Dialogue.getTextProgram());
        uiPrograms.add(debugProgram);

        /*----------------------------------------------------------------------
            Framebuffer
        ----------------------------------------------------------------------*/
        fbo = gl.createFramebuffer();
        rboDepth = gl.createRenderbuffer();
        fbTexture = Texture.get($.TEX_FB);

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
    },
    render()
    {
        for (const [drawable] of Scene.all(Drawable))
        {
            if (drawable.isVisible)
            {
                queues.get(drawable.priority).add(drawable);
            }
        }

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
    }
};

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
    const debugMesh = debugProgram.getDynamicMesh();
    const [ground] = Scene.one($.ENT_GROUND, Ground);

    debugMesh.setValuesAtIndex(0,
        ground.minx, 0, ground.minz,
        ground.maxx, 0, ground.minz,

        ground.maxx, 0, ground.minz,
        ground.maxx, 0, ground.maxz,

        ground.maxx, 0, ground.maxz,
        ground.minx, 0, ground.maxz,

        ground.minx, 0, ground.maxz,
        ground.minx, 0, ground.minz,
    );

    Buffer.setData($.BUF_ARR_DEBUG, debugMesh);
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

    const { drawMode, drawSize } = program.getModel();

    const vao = Vao.get(program);
    Vao.bind(vao);
    gl.drawArrays(drawMode, 0, drawSize);
    Vao.unbind();
};

let fbo;
let rboDepth;
let fbTexture;

const queues = new SafeMap([
    [$.QUE_BACKGROUND, new SafeSet()],
    [$.QUE_SPRITE, new SafeSet()],
    [$.QUE_UI, new SafeSet()]
]);

const uiPrograms = new SafeSet();

let debugProgram;
