import * as $ from "./const";
import { Mouse } from "./mouse";
import { Scene } from "./scene";
import { SafeMap } from "./utils/better-builtins";
import "./audio-player";

const mainLoop = (timestamp) =>
{
    if (activeScene)
    {
        const dt = (timestamp - oldTimestamp) * 1e-3;
        activeScene.update(dt);
    }

    Mouse.isWorldClick = false;
    oldTimestamp = timestamp;
    window.requestAnimationFrame(mainLoop);
};

export const setActiveScene = (sceneId) =>
{
    if (activeScene)
    {
        if (activeScene.sceneId === sceneId) throw Error;

        activeScene.unload();
    }

    if (!scenes.has(sceneId))
    {
        const scene = new Scene(sceneId);
        scenes.set(sceneId, scene);
    }

    activeScene = scenes.get(sceneId);
    activeScene.load();
};

const scenes = new SafeMap();

let activeScene;
setActiveScene($.SCENE_TEST);

let oldTimestamp = 0;

mainLoop(0);
