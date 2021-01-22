import * as $ from "./const";
import { ProgramData } from "./gl/program-data";
import { Texture } from "./gl/texture";
import { Bezier } from "./math/bezier";
import { isString } from "./utility";

export const Dialogue = {
    getBubbleTexture()
    {
        return bubbleTexture;
    },
    getProgramData()
    {
        return program;
    },
    getTextTexture()
    {
        return textTexture;
    },
    setText(str)
    {
        textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
        bubbleCtx.clearRect(0, 0, bubbleCanvas.width, bubbleCanvas.height);

        //drawDebug();
        //drawBackground();
        drawSplitString(str, y);

        Texture.flip(true);
        Texture.bind(textTexture);
        Texture.from(textCanvas);
        Texture.parami($.TEXTURE_MIN_FILTER, $.LINEAR);
        Texture.unbind();
        Texture.flip(false);

        drawBubble();

        Texture.flip(true);
        Texture.bind(bubbleTexture);
        Texture.from(bubbleCanvas);
        Texture.parami($.TEXTURE_MIN_FILTER, $.LINEAR);
        Texture.unbind();
        Texture.flip(false);
    }
};

const drawDebug = () =>
{
    textCtx.fillStyle = "black";
    textCtx.shadowBlur = 0;
    textCtx.shadowOffsetX = 0;
    textCtx.shadowOffsetY = 0;
    textCtx.fillRect(x, y, width, (fontSize + fontPad) * 3);
};

const drawBubble = () =>
{
    bubbleCtx.fillStyle = "#0000009f";
    bubbleCtx.shadowBlur = 0;
    bubbleCtx.shadowOffsetX = 0;
    bubbleCtx.shadowOffsetY = 0;

    bubbleCtx.beginPath();
    let start = beziars[0];
    bubbleCtx.moveTo(start.x, start.y);

    for (let i = 0; i < beziars.length; i++)
    {
        const end = beziars[(i + 1) % beziars.length];

        bubbleCtx.bezierCurveTo(
            start.cp2x, start.cp2y,
            end.cp1x, end.cp1y,
            end.x, end.y
        );

        start = end;
    }

    bubbleCtx.closePath();
    bubbleCtx.fill();
};

const drawSplitString = (str, yPos) =>
{
    textCtx.fillStyle = "#fff";
    textCtx.shadowBlur = 5;
    textCtx.shadowOffsetX = 3;
    textCtx.shadowOffsetY = 3;

    const words = str.split(/(?=\s)/);
    let fits;
    let maybeFits;

    for (const word of words)
    {
        maybeFits = isString(maybeFits) ? maybeFits + word : word.trimStart();

        if (textCtx.measureText(maybeFits).width <= width)
        {
            fits = maybeFits;
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

            drawText(fits, yPos);
            fits = null;
            yPos += fontSize + fontPad;
        }
    }

    if (fits)
    {
        drawText(fits, yPos);
    }
};

const drawText = (str, yPos) =>
{
    textCtx.fillText(str, x, yPos);
};

const program = new ProgramData($.PROG_SCREEN);
program.setAttributes($.MODEL_SCREEN);

const textCanvas = window.document.createElement("canvas");
const bubbleCanvas = window.document.createElement("canvas");

const textCtx = textCanvas.getContext("2d");
const bubbleCtx = bubbleCanvas.getContext("2d");

const textTexture = Texture.create();
const bubbleTexture = Texture.create();

textCanvas.width = $.SCREEN_WIDTH;
textCanvas.height = $.SCREEN_HEIGHT;

bubbleCanvas.width = $.SCREEN_WIDTH;
bubbleCanvas.height = $.SCREEN_HEIGHT;

/*------------------------------------------------------------------------------
    Draw area
------------------------------------------------------------------------------*/
const fontSize = 32;
const fontPad = 10;

const x = 0.3 * $.SCREEN_WIDTH;
const width = $.SCREEN_WIDTH - 2*x;
const y = 0.69 * $.SCREEN_HEIGHT;

textCtx.textAlign = "left";
textCtx.textBaseline = "top";
textCtx.font = `${fontSize}px Arial`;
textCtx.shadowColor = "#000";

const beziars = [
    new Bezier(0.25, 0.65, 89, 130, 240),
    new Bezier(0.78, 0.77, 110, 60, 82),
    new Bezier(0.393, 0.98, 256, 122, -4)
];

Dialogue.setText(`
Yume nante kanaru wake nai shi yaritakunai koto yamazumi de utsu ni naru hi mo ookute iya ni naru na
`);
