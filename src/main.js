import { mouse } from "./dom";
import { Scene } from "./scene";

import * as $ from "./utils/const";

// Processes
import { processCamera } from "./processes/process-camera";
import { processMotion } from "./processes/process-motion";

const sceneMap = new Map([
    [$.SCENE_TEST, new Scene(
        [
            processMotion,
            processCamera
        ]
    )]
]);

export const setActiveScene = (sceneId) =>
{
    if (activeScene)
    {
        activeScene.jobs = activeScene.inactiveJobs;
    }

    activeScene = sceneMap.get(sceneId);
    activeScene.jobs = activeScene.activeJobs;
};

let activeScene;
setActiveScene($.SCENE_TEST);

let oldTimestamp = 0;

const loop = (timestamp) =>
{
    const dt = (timestamp - oldTimestamp) * 1e-3;
    activeScene.update(dt);

    mouse.isClick = false;
    oldTimestamp = timestamp;
    window.requestAnimationFrame(loop);
};

loop(0);
