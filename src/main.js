import * as $ from "./const";
import { Dom } from "./dom";

import { Buffer } from "./gl/buffer";
import { Texture } from "./gl/texture";
import { ShaderProgram } from "./gl/shader-program";
import { Renderer } from "./gl/renderer";
import { Camera } from "./camera";
import { Dialogue } from "./dialogue";

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

const init = () =>
{
    // These all depend on gl resources in some way. This function
    // can be used to reinitialize everything in case of lost context
    // https://www.khronos.org/webgl/wiki/HandlingContextLost
    Buffer.init();
    Texture.init();
    ShaderProgram.init();
    Dialogue.init();
    Renderer.init();
    Camera.init();
};

init();

let isReady = false;
let oldTimestamp = 0;
window.requestAnimationFrame(mainLoop);

Model.load().then(() =>
{
    Dom.hideLoading();
    Scene.setPendingLoad($.SCN_TEST);
    isReady = true;
});
