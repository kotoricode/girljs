import * as $ from "./const";
import { BoxCollider } from "./math/box-collider";
import { Space } from "./components/space";
import { Motion } from "./components/motion";
import { Player } from "./components/player";
import { Sprite } from "./components/sprite";
import { Collider } from "./components/collider";
import { processMotion } from "./processes/process-motion";
import { processCamera } from "./processes/process-camera";

export const blueprint = new Map([
    [
        $.SCENE_TEST, () => ({
            entities: {
                [$.ENTITY_PLAYER]: {
                    components: [
                        new Space(),
                        new Motion(300),
                        new Player(),
                        new Sprite($.PROGRAM_SPRITE, $.MODEL_PLAYER2)
                    ],
                    children: {}
                },
                [$.ENTITY_GROUND]: {
                    components: [
                        new Space(),
                        new Collider(new BoxCollider(-300, -300, 600, 600)),
                        new Sprite(
                            $.PROGRAM_TILED,
                            $.MODEL_GROUND,
                            {
                                [$.U_UVREPEAT]: [5, 5],
                                [$.U_COLOR]: [1, 0.7, 0.5, 1]
                            }
                        )
                    ],
                    children: {}
                }
            },
            processes: [
                processMotion,
                processCamera
            ]
        })
    ]
]);
