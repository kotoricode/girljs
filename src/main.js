import * as $ from "./const";
import { Dom, Mouse } from "./dom";
import { Scene } from "./scene";
import "./audio-player";
import { Model } from "./gl/model";

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
Scene.load($.SCENE_TEST);

Model.load().then(() =>
{
    Dom.hideLoading();
    isReady = true;
});

mainLoop(0);
