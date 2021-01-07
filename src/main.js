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

    mouse.isWorldClick = false;
    oldTimestamp = timestamp;
    window.requestAnimationFrame(mainLoop);
};

export const setActiveScene = (sceneId) =>
{
    if (activeScene)
    {
        if (activeScene.sceneId === sceneId)
        {
            throw sceneId;
        }

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

const scenes = new Map();

let activeScene;
setActiveScene($.SCENE_TEST);

let oldTimestamp = 0;

mainLoop(0);
