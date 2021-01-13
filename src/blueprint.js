import * as $ from "./const";

import { Space } from "./components/space";
import { Motion } from "./components/motion";
import { Player } from "./components/player";
import { Sprite } from "./components/sprite";
import { Ground } from "./components/ground";
import { Anim } from "./components/anim";

import { processMotion } from "./processes/process-motion";
import { processCamera } from "./processes/process-camera";
import { processAnimation } from "./processes/process-animation";

export const blueprint = new Map([
    [$.SCENE_TEST, () => ({
        entities: new Map([
            [$.ENTITY_PLAYER, {
                components: [
                    new Space(),
                    new Motion(3),
                    new Player(),
                    new Sprite($.PROG_SPRITE, $.MODEL_BRAID_00),
                    new Anim(new Map([
                        [$.ANIM_IDLE, [$.MODEL_BRAID_00]],
                        [$.ANIM_MOVE, [
                            $.MODEL_BRAID_00,
                            $.MODEL_BRAID_01,
                            $.MODEL_BRAID_02,
                            $.MODEL_BRAID_03,
                            $.MODEL_BRAID_04,
                            $.MODEL_BRAID_05,
                            $.MODEL_BRAID_06,
                            $.MODEL_BRAID_07,
                            $.MODEL_BRAID_08,
                            $.MODEL_BRAID_09,
                            $.MODEL_BRAID_10,
                            $.MODEL_BRAID_11,
                            $.MODEL_BRAID_12,
                            $.MODEL_BRAID_13,
                            $.MODEL_BRAID_14,
                            $.MODEL_BRAID_15,
                            $.MODEL_BRAID_16,
                            $.MODEL_BRAID_17,
                            $.MODEL_BRAID_18,
                            $.MODEL_BRAID_19,
                            $.MODEL_BRAID_20,
                            $.MODEL_BRAID_21,
                            $.MODEL_BRAID_22,
                            $.MODEL_BRAID_23,
                            $.MODEL_BRAID_24,
                            $.MODEL_BRAID_25,
                            $.MODEL_BRAID_26,
                        ]],
                    ]), new Map([
                        [$.ANIM_IDLE, [Infinity]],
                        [$.ANIM_MOVE, [0.045]],
                    ]))
                ],
                children: null
            }],
            [$.ENTITY_GROUND, {
                components: [
                    new Space(),
                    new Ground(-2, 2, -2, 2),
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
            processAnimation,
            processCamera
        ]
    })]
]);
