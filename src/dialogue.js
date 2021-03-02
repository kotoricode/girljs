import * as $ from "./const";
import { Model } from "./gl/model";
import { Program } from "./gl/program";
import { Texture } from "./gl/texture";
import { SmoothBezier } from "./math/smooth-bezier";
import { Matrix } from "./math/matrix";
import { isSet, clamp } from "./utility";
import { Camera } from "./camera";

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
            const line = dialogueScript[dialogueScriptIndex++];
            drawDialogueText(line);
        }

        text.canvasToTexture();
    },
    drawBubble()
    {
        bubble.clear();
        drawBubble();
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

        Model.load().then(() =>
        {
            text.canvasToTexture();
            bubble.canvasToTexture();
            this.setScript(["one", "two", "three"]);
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

const drawBubble = () =>
{
    const { ctx } = bubble;

    const arrowTip = Camera.worldToClip(1.09704, 0.76, -3.02629);
    const arrowTipX = arrowTip[0];

    const arrowLeft = clamp(
        arrowTipX - arrowHalfWidthPx,
        leftPx,
        arrowLeftMax
    );

    const arrowRight = clamp(
        arrowTipX + arrowHalfWidthPx,
        arrowRightMin,
        rightPx
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
};


const drawDialogueText = (str) =>
{
    const words = str.split(/(?=\s)/);

    const lines = [];
    let line = null;
    const STR_EMPTY = "";
    let word;
    let testLine = STR_EMPTY;

    for (let i = 0; i < words.length;)
    {
        word = words[i++];
        testLine += word;
        const isFitting = text.ctx.measureText(testLine).width <= widthPx;

        if (isFitting)
        {
            line = testLine;

            if (i < words.length)
            {
                continue;
            }
        }

        if (!line)
        {
            console.warn(`Word too long: ${testLine}`);
            line = testLine;
            testLine = STR_EMPTY;
        }
        else
        {
            testLine = word;
        }

        lines.push(line.trimStart());
        line = null;
    }

    const iMod = 0.5 * lines.length;

    for (let i = 0; i < lines.length; i++)
    {
        text.ctx.fillText(
            lines[i],
            leftPx,
            midYPx + fontSizePx * (i - iMod)
        );
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

const leftPx = left * $.RES_WIDTH;
const rightPx = right * $.RES_WIDTH;
const widthPx = rightPx - leftPx;
const topPx = top * $.RES_HEIGHT;

const midYPx = (bottom - (bottom - top) / 2) * $.RES_HEIGHT;

const arrowWidthPx = 50;
const arrowHalfWidthPx = arrowWidthPx / 2;
const arrowTopPx = topPx - 50;

const arrowLeftMax = rightPx - arrowWidthPx;
const arrowRightMin = leftPx + arrowWidthPx;

const boxCpDist = 100;

const bezierSpeech0 = new SmoothBezier(right, top, boxCpDist, boxCpDist, 180);
const bezierSpeech1 = new SmoothBezier(right, bottom, boxCpDist, boxCpDist, 0);
const bezierSpeech2 = new SmoothBezier(left, bottom, boxCpDist, boxCpDist, 0);
const bezierSpeech3 = new SmoothBezier(left, top, boxCpDist, boxCpDist, 180);

let text;
let bubble;
let dialogueScript;
let dialogueScriptIndex;
