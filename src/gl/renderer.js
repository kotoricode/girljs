import * as $ from "../const";
import { gl } from "../main";

import { hsvToRgb, setArrayValues } from "../utility";
import { Matrix } from "../math/matrix";

import { Vao } from "./vao";
import { Buffer } from "./buffer";
import { Texture } from "./texture";
import { Program } from "./program";

import { Drawable } from "../components/drawable";
import { Ground } from "../components/ground";

import { Ui } from "../ui";
import { Scene } from "../scene";
import { HitBox } from "../components/hitbox";

export const Renderer = {
    init()
    {
        gl.enable($.BLEND);
        gl.blendFunc($.SRC_ALPHA, $.ONE_MINUS_SRC_ALPHA);

        const imageProgram = new Program($.PRG_IMAGE, $.MDL_FRAMEBUFFER);
        debugProgram = new Program($.PRG_DEBUG, $.MDL_DEBUG);
        debugProgram.stageUniform($.U_COLOR, debugColor);

        imageProgram.stageUniformIndexed($.U_TRANSFORM, 1, Matrix.identity());

        const dialogueProgram = Ui.getProgram();

        uiPrograms.clear();
        uiPrograms.add(imageProgram);
        uiPrograms.add(dialogueProgram);
        uiPrograms.add(debugProgram);

        /*----------------------------------------------------------------------
            Framebuffer
        ----------------------------------------------------------------------*/
        fbo = gl.createFramebuffer();
        rboDepth = gl.createRenderbuffer();
        fbTexture = Texture.get($.TEX_FRAMEBUFFER);

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
        gl.disable($.CULL_FACE);
        drawQueue($.QUE_SPRITE);
        gl.disable($.DEPTH_TEST);
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
    gl.drawElements(drawMode, drawSize, $.UNSIGNED_SHORT, drawOffset);
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
    let indexOffset = 0;
    const debugIndex = debugProgram.getDynamicIndex();

    indexOffset = setArrayValues(debugIndex, indexOffset,
        0, 1,
        1, 2,
        2, 3,
        3, 0,
    );

    let meshOffset = 0;
    const debugMesh = debugProgram.getDynamicMesh();
    const [{ minx, maxx, minz, maxz }] = Scene.one($.ENT_GROUND, Ground);

    meshOffset = setArrayValues(debugMesh, meshOffset,
        minx, 0, maxz,
        maxx, 0, maxz,
        maxx, 0, minz,
        minx, 0, minz
    );

    for (const [{ min, max }] of Scene.all(HitBox))
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
            min.x, min.y, min.z,
            min.x, min.y, max.z,
            max.x, min.y, max.z,
            max.x, min.y, min.z,

            min.x, max.y, min.z,
            min.x, max.y, max.z,
            max.x, max.y, max.z,
            max.x, max.y, min.z,
        );
    }

    const model = debugProgram.getModel();
    model.drawSize = indexOffset;
    Buffer.setDataBind(model.aBufferId, debugMesh);
    Buffer.setDataBind(model.indexBufferId, debugIndex);
};

let fbo;
let rboDepth;
let fbTexture;

const queues = new Map([
    [$.QUE_BACKGROUND, new Set()],
    [$.QUE_SPRITE, new Set()],
    [$.QUE_UI, new Set()]
]);

const uiPrograms = new Set();

let debugProgram;
const debugColor = [0, 0, 0, 1];
let debugHue = 0;
