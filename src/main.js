import * as $ from "./const";
import { Dom, Mouse } from "./dom";
import { Scene } from "./scene";
import "./audio-player";
import { Model } from "./gl/model";
import { Debug } from "./gl/debug";
import { Renderer } from "./gl/renderer";
import { Dialogue } from "./dialogue";

const mainLoop = (timestamp) =>
{
    if (isReady)
    {
        const dt = (timestamp - oldTimestamp) * 1e-3;
        Scene.update(dt);
        Mouse.isWorldClick = false;
    }

    oldTimestamp = timestamp;
    window.requestAnimationFrame(mainLoop);
};

let isReady = false;
let oldTimestamp = 0;
mainLoop(0);

Model.load().then(() =>
{
    Debug.init();
    Dialogue.init();
    Renderer.init();

    Dom.hideLoading();
    Scene.load($.SCN_TEST);
    isReady = true;
});

