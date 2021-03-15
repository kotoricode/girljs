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

import { Scene } from "../scene";
import { HitBox } from "../components/hitbox";

export const Renderer = {
    init()
    {
        const aaSamples = Math.min(4, gl.getParameter($.MAX_SAMPLES));

        gl.enable($.BLEND);
        gl.blendFunc($.SRC_ALPHA, $.ONE_MINUS_SRC_ALPHA);

        imageProgram = new Program($.PRG_IMAGE, $.MDL_FRAMEBUFFER);
        debugProgram = new Program($.PRG_DEBUG, $.MDL_DEBUG);
        debugProgram.stageUniform($.U_COLOR, debugColor);

        imageProgram.stageUniformIndexed($.U_TRANSFORM, 1, Matrix.identity());

        /*----------------------------------------------------------------------
            Source FBO (multisample color RBO, multisample depth RBO)
        ----------------------------------------------------------------------*/
        fboSrc = gl.createFramebuffer();
        gl.bindFramebuffer($.FRAMEBUFFER, fboSrc);

        // Color
        const rboColor = gl.createRenderbuffer();
        gl.bindRenderbuffer($.RENDERBUFFER, rboColor);

        gl.renderbufferStorageMultisample(
            $.RENDERBUFFER,
            aaSamples,
            $.RGB8,
            $.RES_WIDTH,
            $.RES_HEIGHT
        );

        gl.framebufferRenderbuffer(
            $.FRAMEBUFFER,
            $.COLOR_ATTACHMENT0,
            $.RENDERBUFFER,
            rboColor
        );

        // Depth
        const rboDepth = gl.createRenderbuffer();
        gl.bindRenderbuffer($.RENDERBUFFER, rboDepth);

        gl.renderbufferStorageMultisample(
            $.RENDERBUFFER,
            aaSamples,
            $.DEPTH_COMPONENT16,
            $.RES_WIDTH,
            $.RES_HEIGHT
        );

        gl.framebufferRenderbuffer(
            $.FRAMEBUFFER,
            $.DEPTH_ATTACHMENT,
            $.RENDERBUFFER,
            rboDepth
        );

        gl.bindRenderbuffer($.RENDERBUFFER, null);

        /*----------------------------------------------------------------------
            Destination FBO (color texture)
        ----------------------------------------------------------------------*/
        fboDst = gl.createFramebuffer();
        fboDstTexture = Texture.get($.TEX_FRAMEBUFFER);

        gl.bindFramebuffer($.FRAMEBUFFER, fboDst);

        gl.framebufferTexture2D(
            $.FRAMEBUFFER,
            $.COLOR_ATTACHMENT0,
            $.TEXTURE_2D,
            fboDstTexture,
            0
        );

        gl.bindFramebuffer($.FRAMEBUFFER, null);
    },
    render()
    {
        /*----------------------------------------------------------------------
            Setup
        ----------------------------------------------------------------------*/
        for (const [drawable] of Scene.all(Drawable))
        {
            if (drawable.isVisible)
            {
                queues.get(drawable.priority).add(drawable);
            }
        }

        setDebugLines();

        /*----------------------------------------------------------------------
            Render
        ----------------------------------------------------------------------*/
        gl.bindFramebuffer($.FRAMEBUFFER, fboSrc);

        gl.clearColor(0.15, 0.15, 0.15, 1);
        gl.clear($.COLOR_BUFFER_BIT | $.DEPTH_BUFFER_BIT);

        gl.enable($.DEPTH_TEST);
        gl.enable($.CULL_FACE);
        drawQueue($.QUE_BACKGROUND);
        drawQueue($.QUE_WAYPOINT);
        gl.disable($.CULL_FACE);
        drawQueue($.QUE_SPRITE);

        gl.bindFramebuffer($.READ_FRAMEBUFFER, fboSrc);
        gl.bindFramebuffer($.DRAW_FRAMEBUFFER, fboDst);

        gl.blitFramebuffer(
            0, 0, $.RES_WIDTH, $.RES_HEIGHT,
            0, 0, $.RES_WIDTH, $.RES_HEIGHT,
            $.COLOR_BUFFER_BIT,
            $.LINEAR
        );

        gl.bindFramebuffer($.FRAMEBUFFER, null);
        gl.disable($.DEPTH_TEST);
        draw(imageProgram);
        draw(debugProgram);

        /*----------------------------------------------------------------------
            Finish
        ----------------------------------------------------------------------*/
        for (const queue of queues.values())
        {
            queue.clear();
        }
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

const setDebugLines = () =>
{
    const dt = Scene.getDeltaTime();
    debugHue = (debugHue + dt * 120) % 360;
    hsvToRgb(debugHue, 1, 1, debugColor);

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

let fboSrc;
let fboDst;
let fboDstTexture;

const queues = new Map([
    [$.QUE_BACKGROUND, new Set()],
    [$.QUE_WAYPOINT, new Set()],
    [$.QUE_SPRITE, new Set()]
]);

let imageProgram;
let debugProgram;
const debugColor = [0, 0, 0, 1];
let debugHue = 0;
