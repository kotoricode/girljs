import * as $ from "./const";
import { Model } from "./gl/model";
import { Program } from "./gl/program";
import { Texture } from "./gl/texture";
import { Bezier } from "./math/bezier";
import { Matrix } from "./math/matrix";
import { isSet, isString } from "./utility";

class UiCanvas
{
    constructor(modelId, color)
    {
        this.program = new Program($.PRG_UI, modelId);
        this.program.stageUniform($.U_COLOR, color);
        this.program.stageUniformAtIndex(
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
    init()
    {
        text = new UiCanvas($.MDL_TEXT, [0.2, 0.2, 0.2, 1]);
        bubble = new UiCanvas($.MDL_BUBBLE, [0.95, 0.95, 0.95, 1]);

        text.ctx.textAlign = "left";
        text.ctx.textBaseline = "top";
        text.ctx.font = `${fontSize}px Cuprum`;

        // These are tints for the shaders, not the actual colors
        text.ctx.fillStyle = bubble.ctx.fillStyle = "#fff";
        text.ctx.shadowColor = "#000";

        Model.load().then(canvasToTexture);
    },
    setText(dialogue, speaker)
    {
        Dialogue.clear();

        // Bubble
        drawBubble(bezierSpeech);

        // Text
        drawSpeakerText(speaker);
        drawDialogueText(dialogue);

        canvasToTexture();
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
            start.cp2x, start.cp2y,
            end.cp1x, end.cp1y,
            end.x, end.y
        );

        start = end;
    }

    ctx.closePath();
    ctx.fill();
};

const drawSpeakerText = (str) =>
{
    // TODO
};

const drawDialogueText = (str) =>
{
    const words = str.split(/(?=\s)/);
    let fits;
    let maybeFits;
    let yPos = yPx;

    for (let i = 0; i < words.length; i++)
    {
        const isLastWord = (i === words.length - 1);
        const word = words[i];

        maybeFits = isString(maybeFits) ? maybeFits + word : word.trimStart();

        if (text.ctx.measureText(maybeFits).width <= width)
        {
            if (isLastWord)
            {
                fillText(maybeFits, yPos);
            }
            else
            {
                fits = maybeFits;
            }
        }
        else
        {
            if (fits)
            {
                maybeFits = word.trimStart();
            }
            else
            {
                console.warn(`Word too long: ${maybeFits}`);

                fits = maybeFits;
                maybeFits = null;
            }

            fillText(fits, yPos);
            fits = null;
            yPos += fontSize + fontMargin;

            if (isLastWord && maybeFits)
            {
                fillText(maybeFits, yPos);
            }
        }
    }
};

const fillText = (str, yPos) =>
{
    if (!isSet(yPos)) throw yPos;

    text.ctx.fillText(str, xPx, yPos);
};

/*------------------------------------------------------------------------------
    Draw area
------------------------------------------------------------------------------*/
const fontSize = 32;
const fontMargin = 10;

const x = 0.26;
const y = 0.7;

const xPx = x * $.RES_WIDTH;
const yPx = y * $.RES_HEIGHT;

const width = $.RES_WIDTH - 2*xPx;

const midLineY = 0.7 + (1.5 * fontSize + fontMargin) / $.RES_HEIGHT;

const bezierSpeech = [
    new Bezier(0.2, midLineY, 180, 180, 90),
    new Bezier(0.8, midLineY, 180, 180, -90),
];

let text;
let bubble;
