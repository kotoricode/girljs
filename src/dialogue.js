import * as $ from "./const";
import { ProgramData } from "./gl/program-data";
import { Texture } from "./gl/texture";

export const Dialogue = {
    getProgramData()
    {
        return program;
    },
    getTexture()
    {
        return texture;
    },
    setText(str)
    {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawBackground();

        Dialogue.setFontSettings();
        drawSplitString(str, y);

        Texture.flip(true);
        Texture.bind(texture);
        Texture.from(canvas);
        Texture.parami($.TEXTURE_MIN_FILTER, $.LINEAR);
        Texture.unbind();
        Texture.flip(false);
    },
    setBackgroundSettings()
    {
        ctx.fillStyle = "#0000009f";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    },
    setFontSettings()
    {
        ctx.fillStyle = "#dfdfdf";
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
    }
};

const drawBackground = () =>
{
    Dialogue.setBackgroundSettings();

    ctx.beginPath();
    ctx.moveTo(xEnd, bgTop);
    ctx.quadraticCurveTo(bgRight, bgTop, bgRight, y);
    ctx.lineTo(bgRight, yEnd);
    ctx.quadraticCurveTo(bgRight, bgBottom, xEnd, bgBottom);
    ctx.lineTo(x, bgBottom);
    ctx.quadraticCurveTo(bgLeft, bgBottom, bgLeft, yEnd);
    ctx.lineTo(bgLeft, y);
    ctx.quadraticCurveTo(bgLeft, bgTop, x, bgTop);
    ctx.closePath();
    ctx.fill();
};

const drawSplitString = (str, yPos) =>
{
    const words = str.split(/(?=\s)/);
    let fits;
    let maybeFits;

    for (const word of words)
    {
        maybeFits = maybeFits ? maybeFits+word : word.trimStart();

        if (ctx.measureText(maybeFits).width < width)
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
            yPos += fontSize;
        }
    }

    if (fits)
    {
        drawText(fits, yPos);
    }
};

const drawText = (str, yPos) =>
{
    ctx.fillText(str, x, yPos);
};

const program = new ProgramData($.PROG_SCREEN);
program.setAttributes($.MODEL_SCREEN);
const texture = Texture.create();

const canvas = window.document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvas.width = $.SCREEN_WIDTH;
canvas.height = $.SCREEN_HEIGHT;

/*------------------------------------------------------------------------------
    Draw area
------------------------------------------------------------------------------*/
const padding = 24;
const fontSize = 42;
const bottomMargin = padding / 2;

const x = canvas.width / 6;
const width = canvas.width - 2*x;

const height = fontSize*3;
const y = canvas.height - height - padding - bottomMargin;

ctx.textAlign = "left";
ctx.textBaseline = "top";
ctx.font = `${fontSize}px Arial`;

/*------------------------------------------------------------------------------
    Background
------------------------------------------------------------------------------*/
const bgLeft = x - padding;
const xEnd = x + width;
const bgRight = xEnd + padding;
const bgTop = y - padding;
const yEnd = y + height;
const bgBottom = yEnd + padding;

Dialogue.setText("yksiaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa kaksiaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa kolme neljä viisi kuusi seitsemän kahdeksan yhdeksän kymmenen yksitoista kaksitoista kolmetoista");
