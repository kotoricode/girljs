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

        text.clear();

        if (dialogueScriptIndex === dialogueScript.length)
        {
            dialogueScript = null;
            bubble.clear();
            bubble.canvasToTexture();
        }
        else
        {
            const str = dialogueScript[dialogueScriptIndex++];
            if (!str) throw Error;
            const words = str.split(/(?=\s)/);

            lines.length = 0;
            let line;
            let testLine = "";
            const { ctx } = text;

            for (let i = 0; i < words.length; i++)
            {
                const word = words[i];
                testLine += word;

                if (widthPx < ctx.measureText(testLine).width)
                {
                    if (!line)
                    {
                        console.warn(`Word too long: ${testLine}`);
                        line = testLine;
                    }

                    lines.push(line);
                    line = null;
                    testLine = word.trimStart();
                }
                else
                {
                    line = testLine;
                }
            }

            if (testLine)
            {
                lines.push(testLine);
            }

            const yOffset = 0.5 * lines.length;

            for (let i = 0; i < lines.length; i++)
            {
                ctx.fillText(
                    lines[i],
                    leftPx,
                    midYPx + fontSizePx * (i - yOffset)
                );
            }
        }

        text.canvasToTexture();
    },
    drawBubble()
    {
        bubble.clear();

        const { ctx } = bubble;

        Camera.worldToScreen(1.09704, 0.76, -3.02629, point);

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
            Math.min(arrowSize / (topPx - point.y), 1)
        );

        ctx.beginPath();
        ctx.moveTo(arrowLeft, topPx);
        ctx.lineTo(arrowTipX, arrowTopPx);
        ctx.lineTo(arrowRight, topPx);

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
        bubble = new UiCanvas($.MDL_BUBBLE, [0.95, 0.95, 0.95, 1]);

        text.ctx.textAlign = "left";
        text.ctx.textBaseline = "top";
        text.ctx.font = `${fontSizePx}px Cuprum`;

        // These are tints for the shaders, not the actual colors
        text.ctx.fillStyle = bubble.ctx.fillStyle = "#fff";
        text.ctx.shadowColor = "#000";
        bubble.ctx.strokeStyle = "#333333";

        bubble.ctx.lineWidth = 2;

        Model.load().then(() =>
        {
            text.canvasToTexture();
            bubble.canvasToTexture();
            this.setScript([$.TXT_LOREM, "two", "three"]);
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

const lines = [];
