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

        if (dlgScriptIdx === dlgScript.length)
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
        const str = dlgScript[dlgScriptIdx++];
        const words = str.split(/(?=\s)/);

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
    drawBubble()
    {
        dlgBub.clear();
        const { ctx } = dlgBub;
        Camera.worldToScreen(1.09704, 0.76, -3.02629, bubArrowPoint);
        ctx.beginPath();

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

        ctx.moveTo(arrowLeft, bubT);
        ctx.lineTo(arrowTipX, bubArrowT);
        ctx.lineTo(arrowRight, bubT);

        /*----------------------------------------------------------------------
            Bubble
        ----------------------------------------------------------------------*/
        ctx.lineTo(bubBez0.x, bubBez0.y);

        ctx.bezierCurveTo(
            bubBez0.cpOutX, bubBez0.cpOutY,
            bubBez1.cpInX, bubBez1.cpInY,
            bubBez1.x, bubBez1.y
        );

        ctx.lineTo(bubBez2.x, bubBez2.y);

        ctx.bezierCurveTo(
            bubBez2.cpOutX, bubBez2.cpOutY,
            bubBez3.cpInX, bubBez3.cpInY,
            bubBez3.x, bubBez3.y
        );

        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        dlgBub.canvasToTexture();
    },
    drawText(dt)
    {
        dlgTimer += dt * dlgFadeSpeed;

        dlgTxt.clear();

        for (let i = 0; i < dlgLines.length; i++)
        {
            const lineTimer = dlgTimer - dlgLinesStart[i];

            if (lineTimer < 0)
            {
                // This line and lines after it are not yet shown
                break;
            }

            const widthRatio = dlgLinesRelWidth[i];
            const stopL = (lineTimer - dlgFadeWidth) / widthRatio;

            if (stopL > 1)
            {
                // Line is fully shown, draw in plain color
                dlgTxt.ctx.fillStyle = dlgLineAlpha[255];
            }
            else
            {
                // Line is being shown, draw in gradient
                const stopR = lineTimer / widthRatio;
                const gap = stopR - stopL;

                // Colorstop has to be in range [0.0, 1.0] else error is thrown
                // If the stop should be outside the range, cap it and adjust
                // its alpha instead to preserve the slope
                const alphaL = stopL < 0
                             ? 255 * (stopL / gap + 1) | 0
                             : 255;

                const alphaR = stopR > 1
                             ? 255 * (stopR - 1) / gap | 0
                             : 0;

                const gradient = dlgTxt.ctx.createLinearGradient(
                    bubL, 0,
                    dlgLinesR[i], 0
                );

                gradient.addColorStop(Math.max(0, stopL), dlgLineAlpha[alphaL]);
                gradient.addColorStop(Math.min(1, stopR), dlgLineAlpha[alphaR]);
                dlgTxt.ctx.fillStyle = gradient;
            }

            dlgTxt.ctx.fillText(dlgLines[i], bubL, dlgLinesY[i]);
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
    init()
    {
        dlgTxt = new UiCanvas($.MDL_TEXT, [0.2, 0.2, 0.2, 1]);
        const { ctx: txtCtx } = dlgTxt;
        txtCtx.textAlign = "left";
        txtCtx.textBaseline = "top";
        txtCtx.font = `${dlgFontPx}px Cuprum`;
        txtCtx.fillStyle = dlgLineAlpha[255];

        dlgBub = new UiCanvas($.MDL_BUBBLE, [0.95, 0.95, 0.95, 1]);
        const { ctx: bubCtx } = dlgBub;
        bubCtx.fillStyle = dlgLineAlpha[255];
        bubCtx.strokeStyle = "#333333";
        bubCtx.lineWidth = 2;

        Model.load().then(() =>
        {
            dlgTxt.canvasToTexture();
            dlgBub.canvasToTexture();
            this.setScript(["hey", $.TXT_LOREM, "two", "three"]);
            this.advance();
        });
    },
    setScript(script)
    {
        dlgScript = script;
        dlgScriptIdx = 0;
    }
};

const dlgPrepareLine = (line, width) =>
{
    const idx = dlgLines.length;
    dlgLinesRelWidth[idx] = width / bubW;
    dlgLinesR[idx] = bubL + width;

    let start = 0;

    for (let i = 0; i < dlgLines.length; i++)
    {
        start += dlgLinesRelWidth[i];
    }

    dlgLinesStart[idx] = start;
    dlgLines.push(line);
};

const dlgFontPx = 36;

const bubLRel = 0.23;
const bubRRel = 0.77;
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

let dlgTxt;
let dlgBub;
let dlgScript;
let dlgScriptIdx;
let dlgTimer;

const dlgFadeWidth = 0.1;
const dlgFadeSpeed = 0.75;
const dlgLines = [];
const dlgLinesY = [];
const dlgLinesRelWidth = [];
const dlgLinesR = [];
const dlgLinesStart = [];
const dlgLineAlpha = new Array(256);

for (let i = 0; i < dlgLineAlpha.length; i++)
{
    dlgLineAlpha[i] = `#ffffff${i.toString(16).padStart(2, "0")}`;
}
