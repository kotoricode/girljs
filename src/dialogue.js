import * as $ from "./const";
import { Model } from "./gl/model";
import { Program } from "./gl/program";
import { Texture } from "./gl/texture";
import { Bezier } from "./math/bezier";
import { isNullOrUndefined, isString } from "./utility";

class UiCanvas
{
    constructor(modelId, color)
    {
        this.program = new Program($.PRG_SCREEN, modelId);
        this.program.stageUniform($.U_COLOR, color);

        this.canvas = window.document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = $.RES_WIDTH;
        this.canvas.height = $.RES_HEIGHT;
    }

    clear()
    {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    canvasToTexture()
    {
        const texture = Model.getTexture(this.program.modelId);

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
    setText(dialogue, speaker)
    {
        Dialogue.clear();

        // Bubble
        drawBubble(bezierSpeech);
        drawArrow();

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
    if (isNullOrUndefined(yPos)) throw Error;

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

const arrow = [
    $.RES_WIDTH * 0.686,
    $.RES_HEIGHT * 0.6375,
    $.RES_WIDTH * 0.734,
    $.RES_HEIGHT * 0.63,
    $.RES_WIDTH * 0.775,
    $.RES_HEIGHT * 0.565,
    $.RES_WIDTH * 0.765,
    $.RES_HEIGHT * 0.63,
    $.RES_WIDTH * 0.742,
    $.RES_HEIGHT * 0.674
];

const text = new UiCanvas($.MDL_TEXT, [0.2, 0.2, 0.2, 1]);
const bubble = new UiCanvas($.MDL_BUBBLE, [0.92, 0.92, 0.92, 1]);

text.ctx.textAlign = "left";
text.ctx.textBaseline = "top";
text.ctx.font = `${fontSize}px Cuprum`;

// These are tints for the shaders, not the actual colors
text.ctx.fillStyle = bubble.ctx.fillStyle = "#fff";
text.ctx.shadowColor = "#000";

Model.load().then(() => canvasToTexture());
