import * as $ from "./const";
import { Model } from "./gl/model";
import { Program } from "./gl/program";
import { Texture } from "./gl/texture";
import { SmoothBezier } from "./math/smooth-bezier";
import { Matrix } from "./math/matrix";
import { isSet, clamp, lerp } from "./utility";
import { Camera } from "./camera";
import { Vector } from "./math/vector";

class UiCanvas
{
    constructor(modelId, color)
    {
        this.program = new Program($.PRG_UI, modelId);
        this.program.stageUniform($.U_COLOR, color);
        this.program.stageUniformIndexed(
            $.U_TRANSFORM,
            1,
            Matrix.identity()
        );

        this.canvas = window.document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = $.RES_WIDTH;
        this.canvas.height = $.RES_HEIGHT;
        Object.freeze(this);
    }

    clear()
    {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    canvasToTexture()
    {
        const texture = this.program.getTexture();

        Texture.flip(true);
        Texture.bind(texture);
        Texture.from(this.canvas);
        Texture.parami($.TEXTURE_MIN_FILTER, $.LINEAR);
        Texture.unbind();
        Texture.flip(false);
    }
}

export const Dialogue = {
    advance()
    {
        if (!dlgScript) throw Error;

        if (++dlgScriptIdx === dlgScript.length)
        {
            // Dialogue script end
            dlgScript = null;

            dlgBub.clear();
            dlgTxt.clear();

            dlgBub.canvasToTexture();
            dlgTxt.canvasToTexture();

            return;
        }

        dlgTimer = 0;

        /*----------------------------------------------------------------------
            Split string into lines
        ----------------------------------------------------------------------*/
        const str = dlgScript[dlgScriptIdx];

        // Word boundary positive lookahead whitespace
        const words = str.split(/\b(?=\s)/);

        dlgLines.length = 0;
        let line;
        let lineWidth;
        let testLine = "";
        const { ctx } = dlgTxt;

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

        /*----------------------------------------------------------------------
            Line Y offsets
        ----------------------------------------------------------------------*/
        const yOffset = 0.5 * dlgLines.length;

        for (let i = 0; i < dlgLines.length; i++)
        {
            dlgLinesY[i] = bubMidY + dlgFontPx * (i - yOffset);
        }
    },
    draw(dt)
    {
        /*----------------------------------------------------------------------
            Bubble
        ----------------------------------------------------------------------*/
        dlgBub.clear();
        const { ctx: bubCtx } = dlgBub;
        Camera.worldToScreen(1.09704, 0.76, -3.02629, bubArrowPoint);
        bubCtx.beginPath();

        /*----------------------------------------------------------------------
            Arrow
        ----------------------------------------------------------------------*/
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
            Math.min(1, bubArrowLen / (bubT - bubArrowPoint.y))
        );

        bubCtx.moveTo(arrowLeft, bubT);
        bubCtx.lineTo(arrowTipX, bubArrowT);
        bubCtx.lineTo(arrowRight, bubT);

        /*----------------------------------------------------------------------
            Bubble
        ----------------------------------------------------------------------*/
        bubCtx.lineTo(bubBez0.x, bubBez0.y);

        bubCtx.bezierCurveTo(
            bubBez0.cpOutX, bubBez0.cpOutY,
            bubBez1.cpInX, bubBez1.cpInY,
            bubBez1.x, bubBez1.y
        );

        bubCtx.lineTo(bubBez2.x, bubBez2.y);

        bubCtx.bezierCurveTo(
            bubBez2.cpOutX, bubBez2.cpOutY,
            bubBez3.cpInX, bubBez3.cpInY,
            bubBez3.x, bubBez3.y
        );

        bubCtx.closePath();
        bubCtx.fill();
        bubCtx.stroke();

        dlgBub.canvasToTexture();

        /*----------------------------------------------------------------------
            Text
        ----------------------------------------------------------------------*/
        dlgTimer += dt * dlgFadeSpeed;
        const { ctx: txtCtx } = dlgTxt;

        dlgTxt.clear();

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
                txtCtx.fillStyle = alpha[255];
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
                const alphaL = alpha[255 * Math.min(1, stopL / gap + 1) | 0];
                const alphaR = alpha[255 * Math.max(0, (stopR - 1) / gap) | 0];

                const grad = txtCtx.createLinearGradient(
                    bubL, 0, dlgLinesR[i], 0
                );

                grad.addColorStop(Math.max(0, stopL), alphaL);
                grad.addColorStop(Math.min(1, stopR), alphaR);
                txtCtx.fillStyle = grad;
            }

            txtCtx.fillText(dlgLines[i], bubL, dlgLinesY[i]);
        }

        dlgTxt.canvasToTexture();
    },
    getTextProgram()
    {
        return dlgTxt.program;
    },
    getBubbleProgram()
    {
        return dlgBub.program;
    },
    hasScript()
    {
        return isSet(dlgScript);
    },
    async init()
    {
        dlgTxt = new UiCanvas($.MDL_TEXT, [0.2, 0.2, 0.2, 1]);
        const { ctx: txtCtx } = dlgTxt;
        txtCtx.textAlign = "left";
        txtCtx.textBaseline = "top";
        txtCtx.font = `${dlgFontPx}px Jost`;
        txtCtx.fillStyle = alpha[255];

        dlgBub = new UiCanvas($.MDL_BUBBLE, [0.95, 0.95, 0.95, 1]);
        const { ctx: bubCtx } = dlgBub;
        bubCtx.fillStyle = alpha[255];
        bubCtx.strokeStyle = "#333333";
        bubCtx.lineWidth = 2;

        if (!Model.isLoaded())
        {
            await Model.load();
        }

        dlgTxt.canvasToTexture();
        dlgBub.canvasToTexture();
        this.setScript(["hey", $.TXT_LOREM, "two", "three"]);
        this.advance();
    },
    setScript(script)
    {
        dlgScript = script;
        dlgScriptIdx = -1;
    }
};

const dlgPrepareLine = (line, width) =>
{
    const idx = dlgLines.length;
    dlgLinesRelWidth[idx] = width / bubW;
    dlgLinesR[idx] = bubL + width;

    let start = 0;

    for (let i = 0; i < idx; i++)
    {
        start += dlgLinesRelWidth[i];
    }

    dlgLinesStart[idx] = start;
    dlgLines.push(line);
};

const alpha = new Array(256);

for (let i = 0; i < alpha.length; i++)
{
    alpha[i] = `#ffffff${i.toString(16).padStart(2, "0")}`;
}

/*------------------------------------------------------------------------------
    Dialogue
------------------------------------------------------------------------------*/
let dlgTxt;
let dlgBub;
let dlgScript;
let dlgScriptIdx;
let dlgTimer;

const dlgFontPx = 36;
const dlgFadeWidth = 0.1;
const dlgFadeSpeed = 0.6;
const dlgLines = [];
const dlgLinesY = [];
const dlgLinesRelWidth = [];
const dlgLinesR = [];
const dlgLinesStart = [];

/*------------------------------------------------------------------------------
    Bubble
------------------------------------------------------------------------------*/
const bubLRel = 0.23;
const bubRRel = 1 - bubLRel;
const bubTRel = 0.73;
const bubBRel = 0.98;

const bubL = bubLRel * $.RES_WIDTH;
const bubR = bubRRel * $.RES_WIDTH;
const bubW = bubR - bubL;
const bubT = bubTRel * $.RES_HEIGHT;

const bubMidY = (bubBRel + bubTRel) / 2 * $.RES_HEIGHT;

const bubArrowLen = 50;
const bubArrowWidth = 40;
const bubArrowHalfWidth = bubArrowWidth / 2;
const bubArrowT = bubT - bubArrowLen;

const bubArrowPoint = new Vector();
const bubArrowLMax = bubR - bubArrowWidth;
const bubArrowRMin = bubL + bubArrowWidth;

const bubBez0 = new SmoothBezier(bubRRel, bubTRel, 0, 110, 180);
const bubBez1 = new SmoothBezier(bubRRel, bubBRel, 110, 110, 0);
const bubBez2 = new SmoothBezier(bubLRel, bubBRel, 110, 110, 0);
const bubBez3 = new SmoothBezier(bubLRel, bubTRel, 110, 0, 180);
