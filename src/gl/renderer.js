import * as $ from "../const";
import { gl } from "../dom";

import { hsvToRgb, SafeMap, SafeSet, setArrayValues } from "../utility";
import { Matrix } from "../math/matrix";

import { Vao } from "./vao";
import { Buffer } from "./buffer";
import { Texture } from "./texture";
import { Program } from "./program";

import { Drawable } from "../components/drawable";
import { Ground } from "../components/ground";

import { Dialogue } from "../dialogue";
import { Scene } from "../scene";
import { HitBox } from "../components/hitbox";

export const Renderer = {
    init()
    {
        gl.enable($.BLEND);
        gl.blendFunc($.SRC_ALPHA, $.ONE_MINUS_SRC_ALPHA);

        const imageProgram = new Program($.PRG_IMAGE, $.MDL_FB);
        debugProgram = new Program($.PRG_DEBUG, $.MDL_DEBUG);
        debugProgram.stageUniform($.U_COLOR, debugColor);

        imageProgram.stageUniformIndexed($.U_TRANSFORM, 1, Matrix.identity());

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
        const dt = Scene.getDeltaTime();

        debugHue = (debugHue + dt * 120) % 360;
        hsvToRgb(debugHue, 1, 1, debugColor);

        for (const [drawable] of Scene.all(Drawable))
        {
            if (drawable.isVisible)
            {
                queues.get(drawable.priority).add(drawable);
            }
        }

        debugSetGroundBuffer();

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

const draw = (program) =>
{
    program.activate();

    if (program.isTextured())
    {
        const texture = program.getTexture();
        Texture.bind(texture);
    }

    program.setUniforms();

    const {
        drawMode,
        drawSize,
        drawOffset,
        indexBufferId
    } = program.getModel();

    const vao = Vao.get(program);
    Vao.bind(vao);
    Buffer.bind(indexBufferId);

    gl.drawElements(
        drawMode,
        drawSize,
        $.UNSIGNED_SHORT,
        drawOffset
    );

    Buffer.unbind(indexBufferId);
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

const debugSetGroundBuffer = () =>
{
    const debugMesh = debugProgram.getDynamicMesh();
    const debugIndex = debugProgram.getDynamicIndex();
    const model = debugProgram.getModel();
    const { aBufferId, indexBufferId } = model;
    const [ground] = Scene.one($.ENT_GROUND, Ground);

    let meshOffset = 0;
    let indexOffset = 0;

    indexOffset = setArrayValues(debugIndex, indexOffset,
        0, 1,
        1, 2,
        2, 3,
        3, 0,
    );

    meshOffset = setArrayValues(debugMesh, meshOffset,
        ground.minx, 0, ground.maxz,
        ground.maxx, 0, ground.maxz,
        ground.maxx, 0, ground.minz,
        ground.minx, 0, ground.minz
    );

    for (const [hitbox] of Scene.all(HitBox))
    {
        const i = meshOffset / 3;

        indexOffset = setArrayValues(debugIndex, indexOffset,
            i, i + 1,
            i + 1, i + 2,
            i + 2, i + 3,
            i + 3, i,

            i + 4, i + 5,
            i + 5, i + 6,
            i + 6, i + 7,
            i + 7, i + 4,

            i, i + 4,
            i + 1, i + 5,
            i + 2, i + 6,
            i + 3, i + 7
        );

        meshOffset = setArrayValues(debugMesh, meshOffset,
            hitbox.min.x, hitbox.min.y, hitbox.min.z,
            hitbox.min.x, hitbox.min.y, hitbox.max.z,
            hitbox.max.x, hitbox.min.y, hitbox.max.z,
            hitbox.max.x, hitbox.min.y, hitbox.min.z,

            hitbox.min.x, hitbox.max.y, hitbox.min.z,
            hitbox.min.x, hitbox.max.y, hitbox.max.z,
            hitbox.max.x, hitbox.max.y, hitbox.max.z,
            hitbox.max.x, hitbox.max.y, hitbox.min.z,
        );
    }

    model.drawSize = indexOffset;

    Buffer.setDataBind(aBufferId, debugMesh);
    Buffer.setDataBind(indexBufferId, debugIndex);
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
const debugColor = [0, 0, 0, 1];
let debugHue = 0;
