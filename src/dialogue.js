import * as $ from "./const";
import { ProgramData } from "./gl/program-data";
import { Texture } from "./gl/texture";
import { Bezier } from "./math/bezier";
import { isString } from "./utility";

class UiCanvas
{
    constructor(textureId, color)
    {
        this.programData = new ProgramData($.PROG_SCREEN, $.MODEL_SCREEN);
        this.programData.stageUniform($.U_COLOR, color);

        this.canvas = window.document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.texture = Texture.getTexture(textureId);

        this.canvas.width = $.SCREEN_WIDTH;
        this.canvas.height = $.SCREEN_HEIGHT;
    }

    clear()
    {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    canvasToTexture()
    {
        Texture.flip(true);
        Texture.bind(this.texture);
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
    getBubbleTexture()
    {
        return bubble.texture;
    },
    getTextProgramData()
    {
        return text.programData;
    },
    getBubbleProgramData()
    {
        return bubble.programData;
    },
    getTextTexture()
    {
        return text.texture;
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

    ctx.moveTo(
        $.SCREEN_WIDTH * 0.6859375,
        $.SCREEN_HEIGHT * 0.6375
    );

    ctx.quadraticCurveTo(
        $.SCREEN_WIDTH * 0.734,
        $.SCREEN_HEIGHT * 0.63,
        $.SCREEN_WIDTH * 0.775,
        $.SCREEN_HEIGHT * 0.565
    );

    ctx.quadraticCurveTo(
        $.SCREEN_WIDTH * 0.765,
        $.SCREEN_HEIGHT * 0.63,
        $.SCREEN_WIDTH * 0.742,
        $.SCREEN_HEIGHT * 0.674
    );

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
    let yPos = yPix;

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
            yPos += fontSize + fontPad;

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

    text.ctx.fillText(str, xPix, yPos);
};

const text = new UiCanvas($.TEX_UI_TEXT, [1, 1, 1, 1]);
const bubble = new UiCanvas($.TEX_UI_BUBBLE, [0, 0, 0, 0.7]);

/*------------------------------------------------------------------------------
    Draw area
------------------------------------------------------------------------------*/
const fontSize = 32;
const fontPad = 10;

const x = 0.3;
const y = 0.7;

const xPix = x * $.SCREEN_WIDTH;
const yPix = y * $.SCREEN_HEIGHT;

const width = $.SCREEN_WIDTH - 2*xPix;

text.ctx.textAlign = "left";
text.ctx.textBaseline = "top";
text.ctx.font = `${fontSize}px Arial`;

// These are tints for the shaders, not the actual colors
text.ctx.fillStyle = bubble.ctx.fillStyle = "#fff";
text.ctx.shadowColor = "#000";

const midLineY = 0.7 + (1.5 * fontSize + fontPad) / $.SCREEN_HEIGHT;

const bezierSpeech = [
    new Bezier(0.2, midLineY, 180, 180, 90),
    new Bezier(0.8, midLineY, 180, 180, -90),
];

canvasToTexture();
