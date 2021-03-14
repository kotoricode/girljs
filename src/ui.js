import * as $ from "./const";
import { clamp, lerp, HALF_PI } from "./utility";
import { Camera } from "./camera";
import { Vector } from "./math/vector";
import { ctx2d } from "./main";

export const UiArea = {
    activate(newAreaName)
    {
        areaTimer = 0;
        areaName = newAreaName;
    },
    clear()
    {
        ctx2d.clearRect(0, areaClearY, areaClearW, areaClearH);
    },
    draw()
    {
        let offset = 0;

        if (areaTimer < areaShow)
        {
            offset = (areaShow - areaTimer) * areaOffsetMul;
        }
        else if (areaTimer > areaHide)
        {
            offset = (areaTimer - areaHide) * areaOffsetMul;
        }

        ctx2d.fillStyle = "#0008";
        ctx2d.fillRect(offset, areaClearY, areaClearW, areaClearH);

        ctx2d.font = areaFont;
        ctx2d.fillStyle = "#fff";
        ctx2d.fillText(areaName, areaTextX + offset, areaClearY);
    },
    isActive()
    {
        return areaTimer < areaTimerMax;
    },
    isStarted()
    {
        return areaTimer > 0;
    },
    update(dt)
    {
        areaTimer += dt;
    }
};

export const UiDialogue = {
    activate(script)
    {
        dlgScript = script;
        dlgScriptIdx = -1;
        this.advance();
    },
    advance()
    {
        if (!dlgScript || !dlgScript.length) throw Error;

        if (this.isActive() && !dlgIsFullyShown)
        {
            dlgIsFullyShown = true;
        }
        else if (++dlgScriptIdx < dlgScript.length)
        {
            dlgTimer = 0;
            dlgIsFullyShown = false;
            dlgProcessNextLine();
        }
        else
        {
            dlgScript = null;
            dlgScriptIdx = -1;
        }
    },
    clear()
    {
        ctx2d.clearRect(bubClearX, bubClearY, bubClearW, bubClearH);
    },
    draw(dt, textRgb, x, y, z)
    {
        if (!textRgb || textRgb.length !== 7) throw textRgb;

        /*----------------------------------------------------------------------
            Bubble
        ----------------------------------------------------------------------*/
        ctx2d.fillStyle = bubFillStyle;
        ctx2d.strokeStyle = bubStrokeStyle;
        ctx2d.lineWidth = bubLineWidth;

        ctx2d.beginPath();

        if (x !== undefined)
        {
            bubArrowPoint.setValues(x, y, z);
            Camera.worldToScreen(bubArrowPoint);

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
                Math.min(1, bubArrowHeight / Math.abs(bubT - bubArrowPoint.y))
            );

            // arrow
            ctx2d.moveTo(arrowLeft, bubT);
            ctx2d.lineTo(arrowTipX, bubArrowT);
            ctx2d.lineTo(arrowRight, bubT);

            // top-right corner
            ctx2d.lineTo(bubR, bubT);
        }
        else
        {
            // top-right corner
            ctx2d.moveTo(bubR, bubT);
        }

        // right curve
        ctx2d.ellipse(bubR, bubMidY, bubEllX, bubEllY, 0, -HALF_PI, HALF_PI);

        // bottom line
        ctx2d.lineTo(bubL, bubB);

        // left curve
        ctx2d.ellipse(bubL, bubMidY, bubEllX, bubEllY, 0, HALF_PI, -HALF_PI);

        // top line
        ctx2d.closePath();

        ctx2d.fill();
        ctx2d.stroke();

        /*----------------------------------------------------------------------
            Text
        ----------------------------------------------------------------------*/
        if (!dlgIsFullyShown)
        {
            dlgTimer += dt;
            dlgIsFullyShown = dlgTimer >= dlgEndTime;
        }

        dlgDrawText(textRgb);
    },
    isActive()
    {
        return dlgScriptIdx >= 0;
    }
};

const dlgDrawText = (textRgb) =>
{
    ctx2d.font = dlgFont;

    for (let i = 0; i < dlgLines.length; i++)
    {
        if (dlgIsFullyShown)
        {
            ctx2d.fillStyle = textRgb;
        }
        else
        {
            const start = dlgLinesStart[i];

            if (dlgTimer < start)
            {
                // Line isn't shown yet (and neither are lines after it)
                break;
            }

            const lineProgress = (dlgTimer - start) * dlgFadeSpeed;
            const widthRatio = dlgLinesWidth[i];

            // Left colorstop, marks alpha 255
            const stopL = (lineProgress - dlgFadeWidth) / widthRatio;

            if (stopL > 1)
            {
                // Line is fully shown, draw in plain color
                ctx2d.fillStyle = textRgb;
            }
            else
            {
                // Right colorstop, marks alpha 0
                const stopR = lineProgress / widthRatio;

                // Gradient between the stops, alpha falls linearly
                const gap = stopR - stopL;

                // Colorstop must be in range [0.0, 1.0]
                // Slope is kept consistent by adjusting colorstop alpha,
                // to simulate colorstop values outside the range
                const alphaL = 255 * Math.min(1, stopL / gap + 1) | 0;
                const alphaR = 255 * Math.max(0, (stopR - 1) / gap) | 0;

                const grad = ctx2d.createLinearGradient(
                    bubL, 0, dlgLinesR[i], 0
                );

                grad.addColorStop(
                    Math.max(0, stopL),
                    textRgb + byteToHex[alphaL]
                );

                grad.addColorStop(
                    Math.min(1, stopR),
                    textRgb + byteToHex[alphaR]
                );

                ctx2d.fillStyle = grad;
            }
        }

        ctx2d.fillText(dlgLines[i], bubL, dlgLinesY[i]);
    }
};

const dlgProcessNextLine = () =>
{
    // Set correct font for calculating widths
    ctx2d.font = dlgFont;

    // Word boundary positive lookahead whitespace
    const words = dlgScript[dlgScriptIdx].split(/\b(?=\s)/u);

    dlgLines.length = 0;
    let line;
    let lineWidth;
    let testLine = "";

    for (const word of words)
    {
        testLine += word;
        const testLineWidth = ctx2d.measureText(testLine).width;

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
    dlgEndTime = 0;

    for (let i = 0; i < dlgLines.length; i++)
    {
        dlgLinesY[i] = bubMidY + dlgFontPx * (i - yOffset);
        dlgLinesStart[i] = dlgEndTime;
        dlgEndTime += dlgLinesWidth[i] / dlgFadeSpeed;
    }

    dlgEndTime += dlgFadeWidth / dlgFadeSpeed;
};

const dlgPrepareLine = (line, width) =>
{
    const idx = dlgLines.length;
    dlgLinesWidth[idx] = width / bubW;
    dlgLinesR[idx] = bubL + width;
    dlgLines.push(line);
};

const byteToHex = new Array(256);

for (let i = 0; i < byteToHex.length; i++)
{
    byteToHex[i] = i.toString(16).padStart(2, "0");
}

/*------------------------------------------------------------------------------
    Dialogue
------------------------------------------------------------------------------*/
let dlgScript;
let dlgScriptIdx;
let dlgTimer;
let dlgEndTime;
let dlgIsFullyShown;

const dlgFontPx = 0.05 * $.RES_HEIGHT;
const dlgFont = `${dlgFontPx}px Jost`;
const dlgFadeWidth = 0.33;
const dlgFadeSpeed = 1.05;
const dlgLines = [];
const dlgLinesY = [];
const dlgLinesWidth = [];
const dlgLinesR = [];
const dlgLinesStart = [];
const dlgClearMargin = 8;

/*------------------------------------------------------------------------------
    Bubble
------------------------------------------------------------------------------*/
const bubFillStyle = "#ffffff";
const bubStrokeStyle = "#333333";
const bubLineWidth = 2;

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

/*------------------------------------------------------------------------------
    Area
------------------------------------------------------------------------------*/
let areaTimer;
let areaName;

const areaFontPx = 0.05 * $.RES_HEIGHT;
const areaFont = `${areaFontPx}px Jost`;

const areaTimerMax = 5;

const areaTextX = $.RES_WIDTH * 0.01953125;

const areaClearY = $.RES_HEIGHT * 0.075;
const areaClearW = $.RES_WIDTH * 0.3;
const areaClearH = areaFontPx;

const areaShow = 0.5;
const areaHide = 5 - areaShow;
const areaOffsetMul = -areaClearW / areaShow;
