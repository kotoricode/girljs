import * as $ from "./const";
import { Dom, Mouse } from "./dom";
import { Scene } from "./scene";
import "./audio-player";
import { Model } from "./gl/model";

const mainLoop = (timestamp) =>
{
    if (isReady)
    {
        if (Mouse.isPendingClick)
        {
            Mouse.setClick();
        }

        const dt = (timestamp - oldTimestamp) * 0.001;
        Scene.update(dt);

        if (Mouse.isClick)
        {
            Mouse.consumeClick();
        }
    }

    oldTimestamp = timestamp;
    window.requestAnimationFrame(mainLoop);
};

let isReady = false;
let oldTimestamp = 0;
window.requestAnimationFrame(mainLoop);

Model.load().then(() =>
{
    Dom.hideLoading();
    Scene.load($.SCN_TEST);
    isReady = true;
});
