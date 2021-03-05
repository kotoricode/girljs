import * as $ from "./const";
import { Model } from "./gl/model";
import { Program } from "./gl/program";
import { Texture } from "./gl/texture";
import { SmoothBezier } from "./math/smooth-bezier";
import { Matrix } from "./math/matrix";
import { isSet, clamp, lerp } from "./utility";
import { Camera } from "./camera";
import { Vector } from "./math/vector";

class UiCanvas
{
    constructor(modelId, color)
    {
        this.program = new Program($.PRG_UI, modelId);
        this.program.stageUniform($.U_COLOR, color);
        this.program.stageUniformIndexed(
            $.U_TRANSFORM,
            1,
            Matrix.identity()
        );

        this.canvas = window.document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = $.RES_WIDTH;
        this.canvas.height = $.RES_HEIGHT;
        Object.freeze(this);
    }

    clear()
    {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    canvasToTexture()
    {
        const texture = this.program.getTexture();

        Texture.flip(true);
        Texture.bind(texture);
        Texture.from(this.canvas);
        Texture.parami($.TEXTURE_MIN_FILTER, $.LINEAR);
        Texture.unbind();
        Texture.flip(false);
    }
}

export const Dialogue = {
    advance()
    {
        if (!dialogueScript) throw Error;

        if (dialogueScriptIndex === dialogueScript.length)
        {
            dialogueScript = null;

            bubble.clear();
            text.clear();

            bubble.canvasToTexture();
            text.canvasToTexture();

            return;
        }

        dialogueTimer = 0;

        const str = dialogueScript[dialogueScriptIndex++];
        const words = str.split(/(?=\s)/);

        lines.length = 0;
        let line;
        let testLine = "";
        const { ctx } = text;

        for (const word of words)
        {
            testLine += word;

            if (widthPx < ctx.measureText(testLine).width)
            {
                if (!line)
                {
                    console.warn(`Word too long: ${testLine}`);
                    line = testLine;
                    testLine = "";
                }
                else
                {
                    testLine = word.trimStart();
                }

                lines.push(line);
                line = null;
            }
            else
            {
                line = testLine;
            }
        }

        if (line)
        {
            lines.push(line);
        }

        const yOffset = 0.5 * lines.length;
        let fadeStart = 0;

        for (let i = 0; i < lines.length; i++)
        {
            const lineWidth = ctx.measureText(lines[i]).width;
            const widthRatio = lineWidth / widthPx;

            linesY[i] = midYPx + fontSizePx * (i - yOffset);
            linesWidthRatio[i] = widthRatio;
            linesGradientWidth[i] = leftPx + lineWidth;
            linesFadeStart[i] = fadeStart;

            fadeStart += widthRatio;
        }
    },
    drawBubble()
    {
        bubble.clear();
        const { ctx } = bubble;
        Camera.worldToScreen(1.09704, 0.76, -3.02629, point);
        ctx.beginPath();

        /*----------------------------------------------------------------------
            Arrow
        ----------------------------------------------------------------------*/
        const arrowLeft = clamp(
            point.x - arrowHalfSize,
            leftPx,
            arrowLeftMax
        );

        const arrowRight = clamp(
            point.x + arrowHalfSize,
            arrowRightMin,
            rightPx
        );

        const arrowTipX = lerp(
            arrowRight - arrowHalfSize,
            point.x,
            Math.min(1, arrowSize / (topPx - point.y))
        );

        ctx.moveTo(arrowLeft, topPx);
        ctx.lineTo(arrowTipX, arrowTopPx);
        ctx.lineTo(arrowRight, topPx);

        /*----------------------------------------------------------------------
            Bubble
        ----------------------------------------------------------------------*/
        ctx.lineTo(bezierSpeech0.x, bezierSpeech0.y);

        ctx.bezierCurveTo(
            bezierSpeech0.cpOutX, bezierSpeech0.cpOutY,
            bezierSpeech1.cpInX, bezierSpeech1.cpInY,
            bezierSpeech1.x, bezierSpeech1.y
        );

        ctx.lineTo(bezierSpeech2.x, bezierSpeech2.y);

        ctx.bezierCurveTo(
            bezierSpeech2.cpOutX, bezierSpeech2.cpOutY,
            bezierSpeech3.cpInX, bezierSpeech3.cpInY,
            bezierSpeech3.x, bezierSpeech3.y
        );

        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        bubble.canvasToTexture();
    },
    drawText(dt)
    {
        dialogueTimer += dt * lineFadeSpeed;

        text.clear();

        for (let i = 0; i < lines.length; i++)
        {
            const lineTimer = dialogueTimer - linesFadeStart[i];

            if (lineTimer < 0)
            {
                // This line and lines after it are not yet shown
                break;
            }

            const widthRatio = linesWidthRatio[i];
            const stopL = (lineTimer - lineFadeWidth) / widthRatio;

            if (stopL > 1)
            {
                // Line is fully shown, draw in plain color
                text.ctx.fillStyle = alpha[255];
            }
            else
            {
                // Line is being shown, draw in gradient
                const stopR = lineTimer / widthRatio;
                const gap = stopR - stopL;

                // Colorstop has to be in range [0.0, 1.0] else error is thrown
                // If the stop should be outside the range, cap it and adjust
                // its alpha instead to preserve the slope
                const alphaL = stopL < 0
                             ? 255 * (stopL / gap + 1) | 0
                             : 255;

                const alphaR = stopR > 1
                             ? 255 * (stopR - 1) / gap | 0
                             : 0;

                const gradient = text.ctx.createLinearGradient(
                    leftPx, 0,
                    linesGradientWidth[i], 0
                );

                gradient.addColorStop(Math.max(0, stopL), alpha[alphaL]);
                gradient.addColorStop(Math.min(1, stopR), alpha[alphaR]);
                text.ctx.fillStyle = gradient;
            }

            text.ctx.fillText(lines[i], leftPx, linesY[i]);
        }

        text.canvasToTexture();
    },
    getTextProgram()
    {
        return text.program;
    },
    getBubbleProgram()
    {
        return bubble.program;
    },
    hasScript()
    {
        return isSet(dialogueScript);
    },
    init()
    {
        text = new UiCanvas($.MDL_TEXT, [0.2, 0.2, 0.2, 1]);
        text.ctx.textAlign = "left";
        text.ctx.textBaseline = "top";
        text.ctx.font = `${fontSizePx}px Cuprum`;
        text.ctx.fillStyle = alpha[255];

        bubble = new UiCanvas($.MDL_BUBBLE, [0.95, 0.95, 0.95, 1]);
        bubble.ctx.fillStyle = alpha[255];
        bubble.ctx.strokeStyle = "#333333";
        bubble.ctx.lineWidth = 2;

        Model.load().then(() =>
        {
            text.canvasToTexture();
            bubble.canvasToTexture();
            this.setScript(["hey", $.TXT_LOREM, "two", "three"]);
            this.advance();
        });
    },
    isActive()
    {
        return isSet(dialogueScript);
    },
    setScript(script)
    {
        dialogueScript = script;
        dialogueScriptIndex = 0;
    }
};

/*------------------------------------------------------------------------------
    Draw area
------------------------------------------------------------------------------*/
const fontSizePx = 36;

const left = 0.23;
const right = 0.77;
const top = 0.73;
const bottom = 0.98;

const point = new Vector();

const leftPx = left * $.RES_WIDTH;
const rightPx = right * $.RES_WIDTH;
const widthPx = rightPx - leftPx;
const topPx = top * $.RES_HEIGHT;

const midYPx = (bottom - (bottom - top) / 2) * $.RES_HEIGHT;

const arrowSize = 50;
const arrowHalfSize = arrowSize / 2;
const arrowTopPx = topPx - arrowSize;

const arrowLeftMax = rightPx - arrowSize;
const arrowRightMin = leftPx + arrowSize;

const boxCpDist = 100;

const bezierSpeech0 = new SmoothBezier(right, top, boxCpDist, boxCpDist, 180);
const bezierSpeech1 = new SmoothBezier(right, bottom, boxCpDist, boxCpDist, 0);
const bezierSpeech2 = new SmoothBezier(left, bottom, boxCpDist, boxCpDist, 0);
const bezierSpeech3 = new SmoothBezier(left, top, boxCpDist, boxCpDist, 180);

let text;
let bubble;
let dialogueScript;
let dialogueScriptIndex;
let dialogueTimer = 0;

const lineFadeWidth = 0.1;
const lineFadeSpeed = 0.75;
const lines = [];
const linesY = [];
const linesWidthRatio = [];
const linesGradientWidth = [];
const linesFadeStart = [];

const alpha = new Array(256);

for (let i = 0; i < alpha.length; i++)
{
    alpha[i] = `#ffffff${i.toString(16).padStart(2, "0")}`;
}
