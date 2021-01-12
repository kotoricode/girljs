import * as $ from "./const";
import { Space } from "./components/space";
import { Motion } from "./components/motion";
import { Player } from "./components/player";
import { Sprite } from "./components/sprite";
import { processMotion } from "./processes/process-motion";
import { processCamera } from "./processes/process-camera";
import { Ground } from "./components/ground";

export const blueprint = new Map([
    [$.SCENE_TEST, () => ({
        entities: new Map([
            [$.ENTITY_PLAYER, {
                components: [
                    new Space(),
                    new Motion(3),
                    new Player(),
                    new Sprite($.PROG_SPRITE, $.MODEL_PLAYER2)
                ],
                children: null
            }],
            [$.ENTITY_GROUND, {
                components: [
                    new Space(),
                    new Ground(-2, 2, -2, 2),
                    //new Collider(new BoxCollider(-300, -300, 600, 600)),
                    new Sprite(
                        $.PROG_POLYGON,
                        $.MODEL_GROUND,
                        {
                            [$.U_UVREPEAT]: [4, 4],
                            [$.U_COLOR]: [1, 1, 1, 1]
                        }
                    )
                ],
                children: null
            }]
        ]),
        processes: [
            processMotion,
            processCamera
        ]
    })]
]);
