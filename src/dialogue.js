import * as $ from "./const";
import { Model } from "./gl/model";
import { Program } from "./gl/program";
import { Texture } from "./gl/texture";
import { SmoothBezier } from "./math/smooth-bezier";
import { Matrix } from "./math/matrix";
import { isSet } from "./utility";

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

        Dialogue.clear();

        if (dialogueScriptIndex === dialogueScript.length)
        {
            dialogueScript = null;
        }
        else
        {
            const line = dialogueScript[dialogueScriptIndex++];

            drawBubble(bezierSpeech);
            drawDialogueText(line);
        }

        canvasToTexture();
    },
    clear()
    {
        text.clear();
        bubble.clear();
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

        Model.load().then(canvasToTexture);
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

const canvasToTexture = () =>
{
    text.canvasToTexture();
    bubble.canvasToTexture();
};

const drawBubble = (beziers) =>
{
    const { ctx } = bubble;

    ctx.beginPath();
    let start = beziers[0];
    ctx.moveTo(start.x, start.y);

    for (let i = 0; i < beziers.length;)
    {
        const end = beziers[++i % beziers.length];

        ctx.bezierCurveTo(
            start.cpOutX, start.cpOutY,
            end.cpInX, end.cpInY,
            end.x, end.y
        );

        start = end;
    }

    ctx.closePath();
    ctx.fill();
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

const left = 0.2;
const right = 0.8;
const top = 0.7;
const bottom = 0.95;

const leftPx = left * $.RES_WIDTH;
const widthPx = (right - left) * $.RES_WIDTH;
const midYPx = (bottom - (bottom - top) / 2) * $.RES_HEIGHT;

const boxCpDist = 100;

const bezierSpeech = [
    new SmoothBezier(left, top, boxCpDist, boxCpDist, 180),
    new SmoothBezier(right, top, boxCpDist, boxCpDist, 180),
    new SmoothBezier(right, bottom, boxCpDist, boxCpDist, 0),
    new SmoothBezier(left, bottom, boxCpDist, boxCpDist, 0),
];

let text;
let bubble;
let dialogueScript;
let dialogueScriptIndex;
