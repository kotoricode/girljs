import * as $ from "./const";
import { Dom } from "./dom";
import { Scene } from "./scene";
import "./audio-player";
import { Model } from "./gl/model";

const mainLoop = (timestamp) =>
{
    if (isReady)
    {
        const dt = (timestamp - oldTimestamp) * 0.001;
        Scene.update(dt);
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
    Scene.setPendingLoad($.SCN_TEST);
    isReady = true;
});
