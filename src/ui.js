import * as $ from "./const";
import { Model } from "./gl/model";
import { Program } from "./gl/program";
import { Texture } from "./gl/texture";
import { Matrix } from "./math/matrix";
import { isSet, clamp, lerp, HALF_PI } from "./utility";
import { Camera } from "./camera";
import { Vector } from "./math/vector";

export const Ui = {
    getProgram()
    {
        return program;
    },
    async init()
    {
        program = new Program($.PRG_UI, $.MDL_TEXT);
        program.stageUniform($.U_COLOR, [1, 1, 1, 1]);
        program.stageUniformIndexed($.U_TRANSFORM, 1, Matrix.identity());

        canvas = window.document.createElement("canvas");
        canvas.width = $.RES_WIDTH;
        canvas.height = $.RES_HEIGHT;

        ctx = canvas.getContext("2d");
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.font = `${dlgFontPx}px Jost`;
        ctx.fillStyle = "#333333";

        if (!Model.isLoaded())
        {
            await Model.load();
        }

        canvasToTexture();

        /* eslint-disable max-len */
        Dialogue.setScript([
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            "Duis aute irure dolor in reprehenderit in voluptate velit....",
            "four",
            "final five"
        ]);
        /* eslint-enable max-len */

        Dialogue.advance();
    }
};

export const Dialogue = {
    advance()
    {
        if (!dlgScript || !dlgScript.length) throw Error;

        if (dlgScriptIdx > -1 && !dlgIsFullyShown)
        {
            dlgIsFullyShown = true;
        }
        else if (++dlgScriptIdx === dlgScript.length)
        {
            dlgScript = null;
            dlgScriptIdx = -1;
            Dialogue.clear();
            canvasToTexture();
        }
        else
        {
            dlgNext();
        }
    },
    clear()
    {
        ctx.clearRect(bubClearX, bubClearY, bubClearW, bubClearH);
    },
    draw(dt, textRgb)
    {
        if (!textRgb || textRgb.length !== 7) throw textRgb;

        this.clear();

        dlgDrawBubble(new Vector(1, 0.2, -0.3));

        if (dlgIsFullyShown)
        {
            ctx.fillStyle = textRgb;

            for (let i = 0; i < dlgLines.length; i++)
            {
                ctx.fillText(dlgLines[i], bubL, dlgLinesY[i]);
            }
        }
        else
        {
            dlgTimer += dt * dlgFadeSpeed;
            dlgIsFullyShown = dlgTimer >= dlgEndTime;
            dlgDrawLineGradient(textRgb);
        }

        canvasToTexture();
    },
    hasScript()
    {
        return isSet(dlgScript);
    },
    setScript(script)
    {
        dlgScript = script;
        dlgScriptIdx = -1;
    }
};

const canvasToTexture = () =>
{
    const texture = program.getTexture();

    Texture.flip(true);
    Texture.bind(texture);
    Texture.from(canvas);
    Texture.parami($.TEXTURE_MIN_FILTER, $.LINEAR);
    Texture.unbind();
    Texture.flip(false);
};

const dlgDrawBubble = (vecSpeaker) =>
{
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 2;

    ctx.beginPath();

    if (vecSpeaker)
    {
        bubArrowPoint.copy(vecSpeaker);
        Camera.worldToScreen(vecSpeaker);

        const arrowLeft = clamp(
            bubArrowPoint.x - bubArrowHalfWidth,
            bubL,
            bubArrowLMax
        );

        const arrowRight = clamp(
            bubArrowPoint.x + bubArrowHalfWidth,
            bubArrowRMin,
            bubR
        );

        const arrowTipX = lerp(
            arrowRight - bubArrowHalfWidth,
            bubArrowPoint.x,
            Math.min(1, bubArrowHeight / (bubT - bubArrowPoint.y))
        );

        ctx.moveTo(arrowLeft, bubT);
        ctx.lineTo(arrowTipX, bubArrowT);
        ctx.lineTo(arrowRight, bubT);

    }

    ctx.lineTo(bubR, bubT);

    ctx.ellipse(
        bubR, bubMidY,
        bubEllX, bubEllY,
        0,
        -HALF_PI,
        HALF_PI
    );

    ctx.lineTo(bubL, bubB);

    ctx.ellipse(
        bubL, bubMidY,
        bubEllX, bubEllY,
        0,
        HALF_PI,
        -HALF_PI
    );

    ctx.closePath();
    ctx.fill();
    ctx.stroke();
};

const dlgDrawLineGradient = (textRgb) =>
{
    for (let i = 0; i < dlgLines.length; i++)
    {
        const lineTimer = dlgTimer - dlgLinesStart[i];

        if (lineTimer < 0)
        {
            // Line isn't shown yet (and neither are lines after it)
            break;
        }

        const widthRatio = dlgLinesRelWidth[i];

        // Left colorstop, marks alpha 255
        const stopL = (lineTimer - dlgFadeWidth) / widthRatio;

        if (stopL > 1)
        {
            // Line is fully shown, draw in plain color
            ctx.fillStyle = textRgb;
        }
        else
        {
            // Right colorstop, marks alpha 0
            const stopR = lineTimer / widthRatio;

            // Gradient between the stops, alpha falls linearly
            const gap = stopR - stopL;

            // Colorstop must be in range [0.0, 1.0]
            // Slope is kept consistent by adjusting colorstop alpha,
            // to simulate colorstop values outside the range
            const alphaL = 255 * Math.min(1, stopL / gap + 1) | 0;
            const alphaR = 255 * Math.max(0, (stopR - 1) / gap) | 0;

            const grad = ctx.createLinearGradient(bubL, 0, dlgLinesR[i], 0);
            grad.addColorStop(Math.max(0, stopL), textRgb + byteToHex[alphaL]);
            grad.addColorStop(Math.min(1, stopR), textRgb + byteToHex[alphaR]);

            ctx.fillStyle = grad;
        }

        ctx.fillText(dlgLines[i], bubL, dlgLinesY[i]);
    }
};

const dlgNext = () =>
{
    // Word boundary positive lookahead whitespace
    const words = dlgScript[dlgScriptIdx].split(/\b(?=\s)/);

    dlgLines.length = 0;
    let line;
    let lineWidth;
    let testLine = "";

    for (const word of words)
    {
        testLine += word;
        const testLineWidth = ctx.measureText(testLine).width;

        if (bubW < testLineWidth)
        {
            if (!line)
            {
                console.warn(`Word too long: ${testLine}`);
                line = testLine;
                lineWidth = testLineWidth;
                testLine = "";
            }
            else
            {
                testLine = word.trimStart();
            }

            dlgPrepareLine(line, lineWidth);
            line = null;
        }
        else
        {
            line = testLine;
            lineWidth = testLineWidth;
        }
    }

    if (line)
    {
        dlgPrepareLine(line, lineWidth);
    }

    const yOffset = 0.5 * dlgLines.length;
    dlgEndTime = dlgFadeWidth;
    dlgIsFullyShown = false;
    dlgTimer = 0;

    for (let i = 0; i < dlgLines.length; i++)
    {
        dlgLinesY[i] = bubMidY + dlgFontPx * (i - yOffset);
        const width = dlgLinesRelWidth[i];
        dlgLinesStart[i] = dlgEndTime;
        dlgEndTime += width;
    }
};

const dlgPrepareLine = (line, width) =>
{
    const idx = dlgLines.length;
    dlgLinesRelWidth[idx] = width / bubW;
    dlgLinesR[idx] = bubL + width;
    dlgLines.push(line);
};

const byteToHex = new Array(256);

for (let i = 0; i < byteToHex.length; i++)
{
    byteToHex[i] = i.toString(16).padStart(2, "0");
}

let program;
let canvas;
let ctx;

/*------------------------------------------------------------------------------
    Dialogue
------------------------------------------------------------------------------*/
let dlgScript;
let dlgScriptIdx;
let dlgTimer;
let dlgEndTime;
let dlgIsFullyShown;

const dlgFontPx = 0.05 * $.RES_HEIGHT;
const dlgFadeWidth = 0.1;
const dlgFadeSpeed = 1;
const dlgLines = [];
const dlgLinesY = [];
const dlgLinesRelWidth = [];
const dlgLinesR = [];
const dlgLinesStart = [];
const dlgClearMargin = 8;

/*------------------------------------------------------------------------------
    Bubble
------------------------------------------------------------------------------*/
const bubL = 0.225 * $.RES_WIDTH;
const bubR = $.RES_WIDTH - bubL;
const bubT = 0.725 * $.RES_HEIGHT;
const bubB = 0.975 * $.RES_HEIGHT;
const bubW = bubR - bubL;
const bubMidY = (bubB + bubT) / 2;

const bubEllX = 0.0640625 * $.RES_WIDTH;
const bubEllY = bubB - bubMidY;
const bubArrowHeight = 0.0390625 * $.RES_WIDTH;
const bubArrowWidth = 0.03125 * $.RES_WIDTH;
const bubArrowHalfWidth = bubArrowWidth / 2;
const bubArrowT = bubT - bubArrowHeight;

const bubArrowPoint = new Vector();
const bubArrowLMax = bubR - bubArrowWidth;
const bubArrowRMin = bubL + bubArrowWidth;

const bubClearX = bubL - bubEllX - dlgClearMargin;
const bubClearY = bubArrowT - dlgClearMargin;
const bubClearW = $.RES_WIDTH - 2 * bubClearX;
const bubClearH = $.RES_HEIGHT - bubClearY - dlgClearMargin;
