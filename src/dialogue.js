import * as $ from "./const";
import { ProgramData } from "./gl/program-data";
import { Texture } from "./gl/texture";
import { Beziar } from "./math/beziar";
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

    const p2 = { x: 999, y: 557 };
    const p3 = { x: 503, y: 710 };

    const b1 = new Beziar(321, 471, 130, 89, 1.05);

    ctx.moveTo(b1.x, b1.y);
    ctx.bezierCurveTo(b1.cp1x, b1.cp1y, 990, 447, p2.x, p2.y);
    ctx.bezierCurveTo(1005, 614, 758, 717, p3.x, p3.y);
    ctx.bezierCurveTo(382, 706, b1.cp2x, b1.cp2y, b1.x, b1.y);
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
console.log(program);
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

const x = 376;
const width = 528;
const y = 494;

ctx.textAlign = "left";
ctx.textBaseline = "top";
ctx.font = `${fontSize}px Arial`;
ctx.shadowColor = "#000";

Dialogue.setText(`
Yume nante kanaru wake nai shi yaritakunai koto yamazumi de utsu ni naru hi mo ookute iya ni naru na
`);
