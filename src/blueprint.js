import * as $ from "./const";
import { SafeMap, SafeSet } from "./utility";

import { Space }  from "./components/space";
import { Motion } from "./components/motion";
import { Player } from "./components/player";
import { Drawable } from "./components/drawable";
import { Ground } from "./components/ground";
import { Anim }   from "./components/anim";

import { processMotion }    from "./processes/process-motion";
import { processCamera }    from "./processes/process-camera";
import { processAnimation } from "./processes/process-animation";
import { processPlayer }    from "./processes/process-player";

const createPlayer = () => [$.ENTITY_PLAYER, new SafeMap([
    [$.BP_COMPONENTS, new SafeSet([
        new Space(),
        new Motion(3),
        new Player(),
        new Drawable(
            $.PROG_SPRITE,
            $.RENDER_QUEUE_SPRITE,
            $.MODEL_BRAID_00
        ),
        new Anim(new SafeMap([
            [$.ANIM_IDLE, [$.MODEL_BRAID_00]],
            [$.ANIM_MOVE, [
                $.MODEL_BRAID_00,
                $.MODEL_BRAID_02,
                $.MODEL_BRAID_04,
                $.MODEL_BRAID_06,
                $.MODEL_BRAID_08,
                $.MODEL_BRAID_10,
                $.MODEL_BRAID_12,
                $.MODEL_BRAID_14,
                $.MODEL_BRAID_16,
                $.MODEL_BRAID_18,
                $.MODEL_BRAID_20,
                $.MODEL_BRAID_22,
                $.MODEL_BRAID_24,
                $.MODEL_BRAID_26,
            ]],
        ]), new SafeMap([
            [$.ANIM_IDLE, [Infinity]],
            [$.ANIM_MOVE, [0.07]],
        ]))
    ])],
    [$.BP_CHILDREN, new SafeSet()]
])];

const createTachie = () => [$.ENTITY_AV_PLAYER, new SafeMap([
    [$.BP_COMPONENTS, new SafeSet([
        new Space(0.75, -0.2, 0),
        new Drawable(
            $.PROG_UI,
            $.RENDER_QUEUE_UI,
            $.MODEL_AV_PLAYER,
            new SafeMap([
                [$.U_COLOR, [1, 0.871, 0.855, 1]]
            ])
        )
    ])],
    [$.BP_CHILDREN, new SafeSet()]
])];

const createGround = () => [$.ENTITY_GROUND, new SafeMap([
    [$.BP_COMPONENTS, new SafeSet([
        new Space(),
        new Ground(-2, 2, -2, 2),
        new Drawable(
            $.PROG_REPEAT,
            $.RENDER_QUEUE_BACKGROUND,
            $.MODEL_GROUND,
            new SafeMap([
                [$.U_UVREPEAT, [4, 4]],
                [$.U_COLOR, [1, 1, 1, 1]]
            ])
        )
    ])],
    [$.BP_CHILDREN, new SafeSet()]
])];

const createTest = () => [$.ENTITY_TEST, new SafeMap([
    [$.BP_COMPONENTS, new SafeSet([
        new Space(),
        new Drawable(
            $.PROG_SPRITE,
            $.RENDER_QUEUE_BACKGROUND,
            $.MODEL_TEST
        )
    ])],
    [$.BP_CHILDREN, new SafeSet()]
])];

export const blueprint = new SafeMap([
    [$.SCENE_TEST, () => new SafeMap([
        [$.BP_ENTITIES, new SafeMap([
            createPlayer(),
            createGround(),
            createTachie(),
            createTest()
        ])],
        [$.BP_PROCESSES, new SafeSet([
            processMotion,
            processAnimation,
            processCamera,
            processPlayer
        ])]
    ])]
]);
