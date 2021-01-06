import { blueprint } from "./blueprint";
import * as $ from "./const";
import { mouse } from "./dom";
import { Scene } from "./scene";

const mainLoop = (timestamp) =>
{
    if (activeScene)
    {
        const dt = (timestamp - oldTimestamp) * 1e-3;
        activeScene.update(dt);
    }

    mouse.isClick = false;
    oldTimestamp = timestamp;
    window.requestAnimationFrame(mainLoop);
};

export const setActiveScene = (sceneId) =>
{
    if (!scenes.has(sceneId))
    {
        const bp = blueprint.get(sceneId);
        const scene = new Scene(bp);
        scenes.set(sceneId, scene);
    }

    if (activeScene)
    {
        activeScene.unload();
    }

    activeScene = scenes.get(sceneId);
    activeScene.load();
};

const scenes = new Map();

let activeScene;
setActiveScene($.SCENE_TEST);

let oldTimestamp = 0;

mainLoop(0);
