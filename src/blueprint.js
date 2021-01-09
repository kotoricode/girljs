import * as $ from "./const";
import { BoxCollider } from "./math/box-collider";
import { Space } from "./components/space";
import { Motion } from "./components/motion";
import { Player } from "./components/player";
import { Sprite } from "./components/sprite";
import { Collider } from "./components/collider";
import { processMotion } from "./processes/process-motion";
import { processCamera } from "./processes/process-camera";
import { Ground } from "./components/ground";

export const blueprint = new Map([
    [$.SCENE_TEST, () => ({
        entities: new Map([
            [$.ENTITY_PLAYER, {
                components: [
                    new Space(),
                    new Motion(300),
                    new Player(),
                    new Sprite($.PROGRAM_SPRITE, $.MODEL_PLAYER2)
                ],
                children: null
            }],
            [$.ENTITY_GROUND, {
                components: [
                    new Space(),
                    new Ground(-200, 200, -200, 200),
                    //new Collider(new BoxCollider(-300, -300, 600, 600)),
                    new Sprite(
                        $.PROGRAM_TILED,
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
