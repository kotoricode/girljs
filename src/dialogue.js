import * as $ from "./const";
import { ProgramData } from "./gl/program-data";
import { Texture } from "./gl/texture";
import { Bezier } from "./math/bezier";
import { isString } from "./utility";

class UiCanvas
{
    constructor(color)
    {
        this.programData = new ProgramData($.PROG_SCREEN);
        this.programData.setAttributes($.MODEL_SCREEN);
        this.programData.stageUniform($.U_COLOR, color);

        this.canvas = window.document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.texture = Texture.create();

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
    setText(str)
    {
        text.clear();
        drawSplitString(str, y);
        text.canvasToTexture();

        bubble.clear();
        drawBubble();
        bubble.canvasToTexture();
    }
};

const drawDebug = () =>
{
    text.ctx.fillStyle = "black";
    text.ctx.shadowBlur = 0;
    text.ctx.shadowOffsetX = 0;
    text.ctx.shadowOffsetY = 0;
    text.ctx.fillRect(x, y, width, (fontSize + fontPad) * 3);
};

const drawBubble = () =>
{
    bubble.ctx.fillStyle = "#fff";
    bubble.ctx.shadowBlur = 0;
    bubble.ctx.shadowOffsetX = 0;
    bubble.ctx.shadowOffsetY = 0;

    bubble.ctx.beginPath();
    let start = beziars[0];
    bubble.ctx.moveTo(start.x, start.y);

    for (let i = 0; i < beziars.length; i++)
    {
        const end = beziars[(i + 1) % beziars.length];

        bubble.ctx.bezierCurveTo(
            start.cp2x, start.cp2y,
            end.cp1x, end.cp1y,
            end.x, end.y
        );

        start = end;
    }

    bubble.ctx.closePath();
    bubble.ctx.fill();
};

const drawSplitString = (str, yPos) =>
{
    text.ctx.fillStyle = "#fff";
    text.ctx.shadowBlur = 5;
    text.ctx.shadowOffsetX = 3;
    text.ctx.shadowOffsetY = 3;

    const words = str.split(/(?=\s)/);
    let fits;
    let maybeFits;

    for (const word of words)
    {
        maybeFits = isString(maybeFits) ? maybeFits + word : word.trimStart();

        if (text.ctx.measureText(maybeFits).width <= width)
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
    text.ctx.fillText(str, x, yPos);
};

const text = new UiCanvas([1, 1, 1, 1]);
const bubble = new UiCanvas([0, 0, 0, 0.6]);

/*------------------------------------------------------------------------------
    Draw area
------------------------------------------------------------------------------*/
const fontSize = 32;
const fontPad = 10;

const x = 0.3 * $.SCREEN_WIDTH;
const width = $.SCREEN_WIDTH - 2*x;
const y = 0.69 * $.SCREEN_HEIGHT;

text.ctx.textAlign = "left";
text.ctx.textBaseline = "top";
text.ctx.font = `${fontSize}px Arial`;
text.ctx.shadowColor = "#000";

const beziars = [
    new Bezier(0.25, 0.65, 89, 130, 240),
    new Bezier(0.78, 0.77, 110, 60, 82),
    new Bezier(0.393, 0.98, 256, 122, -4)
];

Dialogue.setText(`
Yume nante kanaru wake nai shi yaritakunai koto yamazumi de utsu ni naru hi mo ookute iya ni naru na
`);
