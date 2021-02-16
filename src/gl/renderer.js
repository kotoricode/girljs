import * as $ from "../const";
import { gl } from "../dom";

import { SafeMap, SafeSet } from "../utility";
import { Matrix } from "../math/matrix";

import { Vao } from "./vao";
import { Buffer } from "./buffer";
import { Texture } from "./texture";
import { Program } from "./program";

import { Drawable } from "../components/drawable";
import { Ground } from "../components/ground";

import { Dialogue } from "../dialogue";
import { Scene } from "../scene";

export const Renderer = {
    init()
    {
        gl.enable($.BLEND);
        gl.blendFunc($.SRC_ALPHA, $.ONE_MINUS_SRC_ALPHA);

        const imageProgram = new Program($.PRG_IMAGE, $.MDL_FB);
        debugProgram = new Program($.PRG_DEBUG, $.MDL_DEBUG);

        imageProgram.stageUniformAtIndex($.U_TRANSFORM, 1, Matrix.identity());

        uiPrograms.clear();

        uiPrograms.add(imageProgram);
        uiPrograms.add(Dialogue.getBubbleProgram());
        uiPrograms.add(Dialogue.getTextProgram());
        //uiPrograms.add(debugProgram);

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

        //updateDebugData();

        bindFb();

        gl.clear($.COLOR_BUFFER_BIT | $.DEPTH_BUFFER_BIT);
        gl.clearColor(0.15, 0.15, 0.15, 1);

        gl.enable($.DEPTH_TEST);
        gl.enable($.CULL_FACE);
        drawQueue($.QUE_BACKGROUND);

        gl.disable($.DEPTH_TEST);
        gl.disable($.CULL_FACE);
        drawQueue($.QUE_SPRITE);
        //drawQueue($.QUE_UI);
        drawTest();

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

// const updateDebugData = () =>
// {
//     const debugMesh = debugProgram.getDynamicMesh();
//     const [ground] = Scene.one($.ENT_GROUND, Ground);

//     const { minx, maxx, minz, maxz } = ground;

//     debugMesh.setValuesAtIndex(0,
//         minx, 0, minz,
//         maxx, 0, minz,
//         maxx, 0, minz,
//         maxx, 0, maxz,
//         maxx, 0, maxz,
//         minx, 0, maxz,
//         minx, 0, maxz,
//         minx, 0, minz
//     );

//     Buffer.setData($.BUF_ARR_DEBUG, debugMesh);
// };

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

const drawQueue = (queueId) =>
{
    const queue = queues.get(queueId);

    for (const drawable of queue)
    {
        draw(drawable.program);
    }
};

const drawTest = () =>
{
    const program = debugProgram;
    const debugMesh = debugProgram.getDynamicMesh();
    const [ground] = Scene.one($.ENT_GROUND, Ground);

    const { minx, maxx, minz, maxz } = ground;

    // debugMesh.setValuesAtIndex(0,
    //     minx, 0, minz,
    //     maxx, 0, minz,
    //     maxx, 0, minz,
    //     maxx, 0, maxz,
    //     maxx, 0, maxz,
    //     minx, 0, maxz,
    //     minx, 0, maxz,
    //     minx, 0, minz
    // );

    debugMesh.setValuesAtIndex(0,
        minx, 0, maxz,
        maxx, 0, maxz,
        maxx, 0, minz,
        minx, 0, minz,
    );

    Buffer.setData($.BUF_ARR_DEBUG, debugMesh);

    program.activate();
    program.setUniforms();

    const vao = Vao.get(program);
    Vao.bind(vao);

    const buf = [
        0, 1,
        1, 2,
        2, 3,
        3, 0
    ];

    Buffer.setData($.BUF_ELEM_ARRAY_INDEX, new Uint8Array(buf));
    Buffer.bind($.BUF_ELEM_ARRAY_INDEX);

    gl.drawElements(
        $.LINES,
        buf.length * Uint8Array.BYTES_PER_ELEMENT,
        $.UNSIGNED_BYTE,
        0
    );

    Buffer.unbind($.BUF_ELEM_ARRAY_INDEX);
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
