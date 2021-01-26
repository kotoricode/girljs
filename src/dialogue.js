import * as $ from "./const";
import { Model } from "./gl/model";
import { ProgramData } from "./gl/program-data";
import { Texture } from "./gl/texture";
import { Bezier } from "./math/bezier";
import { isString } from "./utility";

class UiCanvas
{
    constructor(modelId, textureId, color)
    {
        this.programData = new ProgramData($.PROG_SCREEN, modelId);
        this.programData.stageUniform($.U_COLOR, color);

        this.canvas = window.document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = $.VIEW_WIDTH;
        this.canvas.height = $.VIEW_HEIGHT;
    }

    clear()
    {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    canvasToTexture()
    {
        const texture = Model.getTexture(this.programData.modelId);

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
    getTextProgramData()
    {
        return text.programData;
    },
    getBubbleProgramData()
    {
        return bubble.programData;
    },
    setText(dialogue, speaker)
    {
        Dialogue.clear();

        // Bubble
        text.ctx.shadowBlur = 0;
        text.ctx.shadowOffsetX = 0;
        text.ctx.shadowOffsetY = 0;
        drawBubble(bezierSpeech);
        drawArrow();

        // Text
        text.ctx.shadowBlur = 5;
        text.ctx.shadowOffsetX = 3;
        text.ctx.shadowOffsetY = 3;
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

    for (let i = 0; i < beziers.length; i++)
    {
        const end = beziers[(i + 1) % beziers.length];

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

const drawArrow = () =>
{
    const { ctx } = bubble;

    ctx.beginPath();
    ctx.moveTo(arrow[0], arrow[1]);
    ctx.quadraticCurveTo(arrow[2], arrow[3], arrow[4], arrow[5]);
    ctx.quadraticCurveTo(arrow[6], arrow[7], arrow[8], arrow[9]);
    ctx.closePath();
    ctx.fill();
};

const drawSpeakerText = (str) =>
{
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
            if (!fits)
            {
                console.warn(`Word too long: ${maybeFits}`);

                fits = maybeFits;
                maybeFits = null;
            }
            else
            {
                maybeFits = word.trimStart();
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
    if (yPos === undefined) throw Error;

    text.ctx.fillText(str, xPx, yPos);
};

const text = new UiCanvas($.MODEL_TEXT, $.TEX_UI_TEXT, [1, 1, 1, 1]);
const bubble = new UiCanvas($.MODEL_BUBBLE, $.TEX_UI_BUBBLE, [0, 0, 0, 0.7]);

/*------------------------------------------------------------------------------
    Draw area
------------------------------------------------------------------------------*/
const fontSize = 32;
const fontMargin = 10;

const x = 0.3;
const y = 0.7;

const xPx = x * $.VIEW_WIDTH;
const yPx = y * $.VIEW_HEIGHT;

const width = $.VIEW_WIDTH - 2*xPx;

text.ctx.textAlign = "left";
text.ctx.textBaseline = "top";
text.ctx.font = `${fontSize}px Arial`;

// These are tints for the shaders, not the actual colors
text.ctx.fillStyle = bubble.ctx.fillStyle = "#fff";
text.ctx.shadowColor = "#000";

const midLineY = 0.7 + (1.5 * fontSize + fontMargin) / $.VIEW_HEIGHT;

const bezierSpeech = [
    new Bezier(0.2, midLineY, 180, 180, 90),
    new Bezier(0.8, midLineY, 180, 180, -90),
];

const arrow = [
    $.VIEW_WIDTH * 0.6859375,
    $.VIEW_HEIGHT * 0.6375,
    $.VIEW_WIDTH * 0.734,
    $.VIEW_HEIGHT * 0.63,
    $.VIEW_WIDTH * 0.775,
    $.VIEW_HEIGHT * 0.565,
    $.VIEW_WIDTH * 0.765,
    $.VIEW_HEIGHT * 0.63,
    $.VIEW_WIDTH * 0.742,
    $.VIEW_HEIGHT * 0.674
];

canvasToTexture();
