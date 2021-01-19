import * as $ from "./const";
import { gl } from "./dom";
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

        gl.pixelStorei($.UNPACK_FLIP_Y_WEBGL, true);

        Texture.bind(texture);
        Texture.from(canvas);
        Texture.parami($.TEXTURE_MIN_FILTER, $.LINEAR);
        Texture.unbind();

        gl.pixelStorei($.UNPACK_FLIP_Y_WEBGL, false);
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

    const x0 = x - margin;
    const x2 = x + width;
    const x3 = x2 + margin;

    const y0 = y - margin;
    const y2 = y + height;
    const y3 = y2 + margin;

    ctx.beginPath();
    ctx.moveTo(x2, y0);
    ctx.quadraticCurveTo(x3, y0, x3, y);
    ctx.lineTo(x3, y2);
    ctx.quadraticCurveTo(x3, y3, x2, y3);
    ctx.lineTo(x, y3);
    ctx.quadraticCurveTo(x0, y3, x0, y2);
    ctx.lineTo(x0, y);
    ctx.quadraticCurveTo(x0, y0, x, y0);
    ctx.closePath();
    ctx.fill();
};

// TODO: this needs to be optimized
const drawSplitString = (str, yPos) =>
{
    if (ctx.measureText(str).width < width)
    {
        ctx.fillText(str, x, yPos);
    }
    else
    {
        const words = str.split(/(?=\s)/);
        let fits;

        for (let i = 0; i < words.length; i++)
        {
            const maybeFits = words.slice(0, i+1).join("");

            if (ctx.measureText(maybeFits).width < width)
            {
                fits = maybeFits;
            }
            else
            {
                if (!fits)
                {
                    console.warn(`Word too long: ${maybeFits}`);

                    ctx.fillText(maybeFits, x, yPos);
                    i++;
                }
                else
                {
                    ctx.fillText(fits, x, yPos);
                }

                const rest = words.slice(i,words.length).join("");

                if (rest)
                {
                    drawSplitString(rest.trim(), yPos + fontSize);
                }

                break;
            }
        }
    }
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
const margin = 24;
const fontSize = 42;
const bottomMargin = margin / 2;

const x = canvas.width / 6;
const width = canvas.width - 2*x;

const height = fontSize*3;
const y = canvas.height - height - margin - bottomMargin;

const clearMargin = 8;

ctx.textAlign = "left";
ctx.textBaseline = "top";
ctx.font = `${fontSize}px Arial`;

Dialogue.setText("yksi kaksi kolme neljä viisi kuusi seitsemän kahdeksan yhdeksän kymmenen yksitoista kaksitoista kolmetoista");
