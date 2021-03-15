import * as $ from "./const";
import { clamp, lerp, HALF_PI } from "./utility";
import { Camera } from "./camera";
import { Vector } from "./math/vector";
import { ctx2d } from "./main";

export const UiNotification = {
    activate(newAreaName)
    {
        notifTimer = 0;
        notifName = newAreaName;
    },
    clear()
    {
        ctx2d.clearRect(0, notifY, notifW, notifH);
    },
    draw()
    {
        let offset = 0;

        if (notifTimer < notifShow)
        {
            offset = (notifShow - notifTimer) * notifOffsetMul;
        }
        else if (notifTimer > notifHide)
        {
            offset = (notifTimer - notifHide) * notifOffsetMul;
        }

        ctx2d.fillStyle = notifBgColor;
        ctx2d.fillRect(offset, notifY, notifW, notifH);

        ctx2d.font = notifFont;
        ctx2d.fillStyle = notifTextColor;
        ctx2d.fillText(notifName, offset + notifPad, notifY + notifPad);
    },
    isActive()
    {
        return notifTimer < notifTimerMax;
    },
    isStarted()
    {
        return notifTimer > 0;
    },
    update(dt)
    {
        notifTimer += dt;
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
            dlgPrepareLines();
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
        dlgTimer += dt;

        if (!dlgIsFullyShown)
        {
            dlgIsFullyShown = dlgTimer >= dlgEndTime;
        }

        if (dlgIsFullyShown)
        {
            const elapsed = dlgTimer - dlgEndTime;
            const alphaF = (-Math.cos(dlgAdvSpeed * elapsed) + 1) / 2;
            const alpha = byteToHex[255 * alphaF | 0];

            ctx2d.font = dlgAdvFont;
            ctx2d.fillStyle = "#000000" + alpha;
            ctx2d.fillText(
                $.TXT_DLG_NEXT,
                bubR - ctx2d.measureText($.TXT_DLG_NEXT).width,
                bubB - dlgAdvFontPx
            );
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

const dlgPrepareLines = () =>
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

const getTextWidth = (text, font) =>
{
    ctx2d.font = font;

    return ctx2d.measureText(text).width;
};

const byteToHex = new Array(256);

for (let i = 0; i < byteToHex.length; i++)
{
    byteToHex[i] = i.toString(16).padStart(2, "0");
}

const refWidth = 1280;
const refHeight = 720;

/*------------------------------------------------------------------------------
    Dialogue
------------------------------------------------------------------------------*/
let dlgScript;
let dlgScriptIdx;
let dlgTimer;
let dlgEndTime;
let dlgIsFullyShown;

const dlgFontPx = (36 * $.RES_HEIGHT) / refHeight;
const dlgFont = dlgFontPx + "px Jost";
const dlgFadeWidth = 0.17;
const dlgFadeSpeed = 1.05;
const dlgLines = [];
const dlgLinesY = [];
const dlgLinesWidth = [];
const dlgLinesR = [];
const dlgLinesStart = [];
const dlgClearMargin = 8;

const dlgAdvFontPx = (28 * $.RES_HEIGHT) / refHeight;
const dlgAdvFont = dlgAdvFontPx + "px Jost";
const dlgAdvSpeed = 5.5;

/*------------------------------------------------------------------------------
    Bubble
------------------------------------------------------------------------------*/
const bubFillStyle = "#fff";
const bubStrokeStyle = "#333";
const bubLineWidth = 2;

const bubL = 0.225 * $.RES_WIDTH;
const bubR = $.RES_WIDTH - bubL;
const bubT = 0.725 * $.RES_HEIGHT;
const bubB = 0.975 * $.RES_HEIGHT;
const bubW = bubR - bubL;
const bubMidY = (bubB + bubT) / 2;

const bubEllX = (82 * $.RES_WIDTH) / refWidth;
const bubEllY = bubB - bubMidY;
const bubArrowHeight = (50 * $.RES_WIDTH) / refWidth;
const bubArrowWidth = (40 * $.RES_WIDTH) / refWidth;
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
    Notif
------------------------------------------------------------------------------*/
let notifTimer;
let notifName;

const notifBgColor = "#0008";
const notifTextColor = "#fff";

const notifFontPx = 0.05 * $.RES_HEIGHT;
const notifFont = `${notifFontPx}px Jost`;
const notifPad = 0.0125 * $.RES_HEIGHT;

const notifY = $.RES_HEIGHT * 0.075;
const notifW = $.RES_WIDTH * 0.25;
const notifH = notifFontPx + notifPad * 2;

const notifShow = 0.25;
const notifTimerMax = 5;
const notifHide = notifTimerMax - notifShow;
const notifOffsetMul = -notifW / notifShow;
