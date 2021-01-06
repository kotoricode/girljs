import * as $ from "./const";
import { mouse } from "./dom";
import { Scene } from "./scene";
import { processCamera } from "./processes/process-camera";
import { processMotion } from "./processes/process-motion";

const mainLoop = (timestamp) =>
{
    const dt = (timestamp - oldTimestamp) * 1e-3;
    activeScene.update(dt);

    mouse.isClick = false;
    oldTimestamp = timestamp;
    window.requestAnimationFrame(mainLoop);
};

export const setActiveScene = (sceneId) =>
{
    if (activeScene)
    {
        activeScene.jobs = activeScene.inactiveJobs;
    }

    activeScene = sceneMap.get(sceneId);
    activeScene.jobs = activeScene.activeJobs;
};

const sceneMap = new Map([
    [$.SCENE_TEST, new Scene(
        [
            processMotion,
            processCamera
        ]
    )]
]);

let activeScene;
setActiveScene($.SCENE_TEST);

let oldTimestamp = 0;

mainLoop(0);
