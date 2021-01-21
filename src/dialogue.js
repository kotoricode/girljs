import * as $ from "./const";
import { ProgramData } from "./gl/program-data";
import { Texture } from "./gl/texture";
import { Bezier } from "./math/bezier";
import { isString } from "./utility";

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
        console.log("clear");

        drawDebug();
        drawBackground();
        drawSplitString(str, y);

        Texture.flip(true);
        Texture.bind(texture);
        Texture.from(canvas);
        Texture.parami($.TEXTURE_MIN_FILTER, $.LINEAR);
        Texture.unbind();
        Texture.flip(false);
    }
};

const drawDebug = () =>
{
    ctx.fillStyle = "black";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillRect(x, y, width, (fontSize + fontPad) * 3);
};

const drawBackground = () =>
{
    ctx.fillStyle = "#0000009f";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.beginPath();
    let start = beziars[0];
    ctx.moveTo(start.x, start.y);

    for (let i = 0; i < beziars.length; i++)
    {
        const end = beziars[(i + 1) % beziars.length];

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

const drawSplitString = (str, yPos) =>
{
    ctx.fillStyle = "#fff";
    ctx.shadowBlur = 5;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;

    const words = str.split(/(?=\s)/);
    let fits;
    let maybeFits;

    for (const word of words)
    {
        maybeFits = isString(maybeFits) ? maybeFits + word : word.trimStart();

        if (ctx.measureText(maybeFits).width <= width)
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
const fontSize = 32;
const fontPad = 10;

const x = 0.3 * $.SCREEN_WIDTH;
const width = $.SCREEN_WIDTH - 2*x;
const y = 0.69 * $.SCREEN_HEIGHT;

ctx.textAlign = "left";
ctx.textBaseline = "top";
ctx.font = `${fontSize}px Arial`;
ctx.shadowColor = "#000";

const beziars = [
    new Bezier(0.25, 0.65, 89, 130, 240),
    new Bezier(0.78, 0.77, 110, 60, 82),
    new Bezier(0.393, 0.98, 256, 122, -4)
];

Dialogue.setText(`
Yume nante kanaru wake nai shi yaritakunai koto yamazumi de utsu ni naru hi mo ookute iya ni naru na
`);
