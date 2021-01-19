import * as $ from "../const";
import { gl } from "../dom";
import { ProgramData } from "./program-data";
import { Texture } from "./texture";

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
        ctx.clearRect(
            x - clearMargin,
            y - clearMargin,
            width + 2*clearMargin,
            height + 2*clearMargin
        );

        Dialogue.setBackgroundSettings();
        ctx.fillRect(x, y, width, height);

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
        ctx.fillStyle = "#0000007F";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    },
    setFontSettings()
    {
        ctx.fillStyle = "#fff";
        ctx.shadowColor = "#000";
        ctx.shadowBlur = 5;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
    }
};

const drawSplitString = (str, yPos) =>
{
    if (ctx.measureText(str).width < width)
    {
        ctx.fillText(str, x, yPos);
    }
    else
    {
        const words = str.match(/(\s)?[^\s]+/g);
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
                    console.warn(`String too long: ${maybeFits}`);

                    ctx.fillText(maybeFits, x, yPos);
                    i++;
                }
                else
                {
                    ctx.fillText(fits, x, yPos);
                }

                const remaining = words.slice(i,).join("").trim();

                if (remaining)
                {
                    drawSplitString(remaining, yPos + fontSize);
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
const fontSize = 48;
const x = canvas.width / 6;
const y = canvas.height - fontSize*4;
const width = canvas.width - 2*x;
const height = canvas.height - y;
const clearMargin = 8;

ctx.textAlign = "left";
ctx.textBaseline = "top";
ctx.font = `${fontSize}px Arial`;

Dialogue.setText("yksiaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
