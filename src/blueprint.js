import * as $ from "./const";
import { SafeMap, SafeSet } from "./utility";

import { Space }    from "./components/space";
import { Motion }   from "./components/motion";
import { Player }   from "./components/player";
import { Drawable } from "./components/drawable";
import { HitBox }   from "./components/hitbox";
import { Anim }     from "./components/anim";

import { processMotion }    from "./processes/process-motion";
import { processCamera }    from "./processes/process-camera";
import { processAnimation } from "./processes/process-animation";
import { processPlayer }    from "./processes/process-player";

const createPlayer = () => [$.ENT_PLAYER, new SafeMap([
    [$.BLU_COMPONENTS, new SafeSet([
        new Space(),
        new Motion(3),
        new Player(),
        new Drawable(
            $.PRG_SPRITE,
            $.QUE_SPRITE,
            $.MDL_BRAID_00
        ),
        new Anim(new SafeMap([
            [$.ANI_IDLE, [$.MDL_BRAID_00]],
            [$.ANI_MOVE, [
                $.MDL_BRAID_00,
                $.MDL_BRAID_02,
                $.MDL_BRAID_04,
                $.MDL_BRAID_06,
                $.MDL_BRAID_08,
                $.MDL_BRAID_10,
                $.MDL_BRAID_12,
                $.MDL_BRAID_14,
                $.MDL_BRAID_16,
                $.MDL_BRAID_18,
                $.MDL_BRAID_20,
                $.MDL_BRAID_22,
                $.MDL_BRAID_24,
                $.MDL_BRAID_26,
            ]],
        ]), new SafeMap([
            [$.ANI_IDLE, [Infinity]],
            [$.ANI_MOVE, [0.07]],
        ]))
    ])],
    [$.BLU_CHILDREN, new SafeSet()]
])];

// const createTachie = () => [$.ENT_AV_PLAYER, new SafeMap([
//     [$.BLU_COMPONENTS, new SafeSet([
//         new Space(0.75, -0.2, 0),
//         new Drawable(
//             $.PRG_UI,
//             $.QUE_UI,
//             $.MDL_AV_PLAYER,
//             new SafeMap([
//                 [$.U_COLOR, [1, 0.871, 0.855, 1]]
//             ])
//         )
//     ])],
//     [$.BLU_CHILDREN, new SafeSet()]
// ])];

const createGround = () => [$.ENT_GROUND, new SafeMap([
    [$.BLU_COMPONENTS, new SafeSet([
        new Space(),
        new HitBox(-15, 15, -0.1, 0, 0, 3.5),
        new Drawable(
            $.PRG_REPEAT,
            $.QUE_BACKGROUND,
            $.MDL_GROUND,
            new SafeMap([
                [$.U_UVREPEAT, [30, 3.5]],
                [$.U_COLOR, [1, 1, 1, 1]]
            ])
        )
    ])],
    [$.BLU_CHILDREN, new SafeSet()]
])];

const createTest = () => [Symbol(), new SafeMap([
    [$.BLU_COMPONENTS, new SafeSet([
        new Space(),
        new Drawable(
            $.PRG_SPRITE,
            $.QUE_BACKGROUND,
            $.MDL_TEST
        )
    ])],
    [$.BLU_CHILDREN, new SafeSet()]
])];

const createMonkey = () => [Symbol(), new SafeMap([
    [$.BLU_COMPONENTS, new SafeSet([
        new Space(3, 0, 0),
        new Drawable(
            $.PRG_SPRITE,
            $.QUE_BACKGROUND,
            $.MDL_MONKEY
        )
    ])],
    [$.BLU_CHILDREN, new SafeSet()]
])];

export const blueprint = new SafeMap([
    [$.SCN_TEST, () => new SafeMap([
        [$.BLU_ENTITIES, new SafeMap([
            createPlayer(),
            createGround(),
            //createTachie(),
            createTest(),
            createMonkey()
        ])],
        [$.BLU_PROCESSES, new SafeSet([
            processMotion,
            processAnimation,
            processCamera,
            processPlayer
        ])]
    ])]
]);
