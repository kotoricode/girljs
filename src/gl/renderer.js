import * as $ from "../const";
import { gl } from "../dom";
import { Sprite } from "../components/sprite";
import { Publisher } from "../utils/publisher";
import { getDebugProgram } from "./debug";
import { drawArraysVao, setProgram } from "./gl-helper";
import { BufferArray } from "./buffer";
import { Texture } from "./texture";
import { ProgramData } from "./program-data";
import { SafeMap } from "../utils/better-builtins";
import { Rbo } from "./rbo";
import { Fbo } from "./fbo";
import { Model } from "./model";

export const render = (scene) =>
{
    for (const [sprite] of scene.all(Sprite))
    {
        if (sprite.isVisible)
        {
            const queue = queues.get(sprite.programData.programId);
            queue.push(sprite);
        }
    }

    Fbo.bind();
    Rbo.bindDepth();

    let fbTexture;

    if (isCanvasResized)
    {
        fbTexture = Fbo.createTexture();
        const rboDepth = Rbo.createDepth();
        Fbo.attachDepth(rboDepth);

        isCanvasResized = false;
    }
    else
    {
        fbTexture = Fbo.getTexture();
    }

    // Draw world
    gl.clear($.COLOR_BUFFER_BIT | $.DEPTH_BUFFER_BIT);
    gl.clearColor(0.8, 0.8, 0.8, 1.0);
    gl.enable($.DEPTH_TEST);

    for (const queue of queues.values())
    {
        renderQueue(queue);
    }

    Rbo.unbind();
    Fbo.unbind();
    gl.disable($.DEPTH_TEST);

    // Transfer to canvas
    setProgram(viewProgramData);
    Texture.bind(fbTexture);
    //Texture.bind(textTexture);
    drawArraysVao($.TRIANGLES, 0, 6, viewProgramData.vao);
    Texture.unbind();

    // Debug
    renderDebug();
};

const renderDebug = () =>
{
    const programData = getDebugProgram();
    setProgram(programData);

    const bufferSize = BufferArray.getSize($.BUF_ARR_DEBUG);
    drawArraysVao($.LINES, 0, bufferSize / 3, programData.vao);
};

const renderQueue = (queue) =>
{
    for (const { programData, modelId } of queue)
    {
        const texture = Model.getTexture(modelId);

        setProgram(programData);
        Texture.bind(texture);
        programData.setUniforms();
        drawArraysVao($.TRIANGLE_STRIP, 0, 4, programData.vao);
    }

    queue.length = 0;
};

Publisher.subscribe($.EVENT_RESIZED, () => isCanvasResized = true);

// Blending
gl.enable($.BLEND);
gl.blendFunc($.SRC_ALPHA, $.ONE_MINUS_SRC_ALPHA);

const viewProgramData = new ProgramData($.PROG_VIEW);
viewProgramData.setAttributes($.MODEL_IMAGE);
let isCanvasResized = true;

// Queues are ordered
const queues = new SafeMap([
    [$.PROG_POLYGON, []],
    [$.PROG_SPRITE, []],
]);

const textCanvas = window.document.createElement("canvas");
textCanvas.width = 1280;
textCanvas.height = 720;
const ctx = textCanvas.getContext("2d");
ctx.fillStyle = "#00FF00";
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.font = "18px monospace";
ctx.fillText("HTML5 Rocks!", textCanvas.width/2, textCanvas.height/2);

const textTexture = gl.createTexture();

gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
gl.bindTexture(gl.TEXTURE_2D, textTexture);
gl.texImage2D($.TEXTURE_2D, 0, $.RGBA, $.RGBA, $.UNSIGNED_BYTE, textCanvas);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
gl.bindTexture(gl.TEXTURE_2D, null);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
