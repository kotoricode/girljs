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
    setText(str, str2, str3)
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
        ctx.fillText(str, x, y);

        if (str2)
        {
            ctx.fillText(str2, x, y + fontSize);

            if (str3)
            {
                ctx.fillText(str3, x, y + fontSize * 2);
            }
        }

        gl.pixelStorei($.UNPACK_FLIP_Y_WEBGL, true);

        Texture.bind(texture);
        Texture.setFromSource(canvas);
        Texture.setParami($.TEXTURE_MIN_FILTER, $.LINEAR);
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
const x = canvas.width / 6;
const y = canvas.height / 1.3333;
const width = canvas.width - 2*x;
const height = canvas.height - y;
const clearMargin = 8;

const fontSize = 48;
ctx.textAlign = "left";
ctx.textBaseline = "top";
ctx.font = `${fontSize}px Arial`;

Dialogue.setText("iこんにちはせかい");
