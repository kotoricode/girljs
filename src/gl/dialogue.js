import * as $ from "../const";
import { gl } from "../dom";
import { ProgramData } from "./program-data";

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
        ctx.clearRect(x, y, canvas.width - x, canvas.height - y);
        ctx.fillText(str, x, y);

        if (str2)
        {
            ctx.fillText(str2, x, y + fontSize);

            if (str3)
            {
                ctx.fillText(str3, x, y + fontSize * 2);
            }
        }

        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D($.TEXTURE_2D, 0, $.RGBA, $.RGBA, $.UNSIGNED_BYTE, canvas);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    }
};

const fontSize = 64;

const program = new ProgramData($.PROG_SCREEN);
program.setAttributes($.MODEL_SCREEN);

const canvas = window.document.createElement("canvas");
canvas.width = $.SCREEN_WIDTH;
canvas.height = $.SCREEN_HEIGHT;

const ctx = canvas.getContext("2d");
ctx.fillStyle = "#FF00FF";
ctx.textBaseline = "top";
ctx.font = `${fontSize}px Arial`;

const x = canvas.width / 6;
const y = canvas.height / 1.5;

const texture = gl.createTexture();
Dialogue.setText("Testing...");
