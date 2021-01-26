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

const createPlayer = () => [$.ENT_PLAYER, new SafeMap([
    [$.BLU_COMPONENTS, new SafeSet([
        new Space(),
        new Motion(3),
        new Player(),
        new Drawable(
            $.PRO_SPRITE,
            $.QUE_SPRITE,
            $.MOD_BRAID_00
        ),
        new Anim(new SafeMap([
            [$.ANI_IDLE, [$.MOD_BRAID_00]],
            [$.ANI_MOVE, [
                $.MOD_BRAID_00,
                $.MOD_BRAID_02,
                $.MOD_BRAID_04,
                $.MOD_BRAID_06,
                $.MOD_BRAID_08,
                $.MOD_BRAID_10,
                $.MOD_BRAID_12,
                $.MOD_BRAID_14,
                $.MOD_BRAID_16,
                $.MOD_BRAID_18,
                $.MOD_BRAID_20,
                $.MOD_BRAID_22,
                $.MOD_BRAID_24,
                $.MOD_BRAID_26,
            ]],
        ]), new SafeMap([
            [$.ANI_IDLE, [Infinity]],
            [$.ANI_MOVE, [0.07]],
        ]))
    ])],
    [$.BLU_CHILDREN, new SafeSet()]
])];

const createTachie = () => [$.ENT_AV_PLAYER, new SafeMap([
    [$.BLU_COMPONENTS, new SafeSet([
        new Space(0.75, -0.2, 0),
        new Drawable(
            $.PRO_UI,
            $.QUE_UI,
            $.MOD_AV_PLAYER,
            new SafeMap([
                [$.U_COLOR, [1, 0.871, 0.855, 1]]
            ])
        )
    ])],
    [$.BLU_CHILDREN, new SafeSet()]
])];

const createGround = () => [$.ENT_GROUND, new SafeMap([
    [$.BLU_COMPONENTS, new SafeSet([
        new Space(),
        new Ground(-2, 2, -2, 2),
        new Drawable(
            $.PRO_REPEAT,
            $.QUE_BACKGROUND,
            $.MOD_GROUND,
            new SafeMap([
                [$.U_UVREPEAT, [4, 4]],
                [$.U_COLOR, [1, 1, 1, 1]]
            ])
        )
    ])],
    [$.BLU_CHILDREN, new SafeSet()]
])];

const createTest = () => [$.ENT_TEST, new SafeMap([
    [$.BLU_COMPONENTS, new SafeSet([
        new Space(),
        new Drawable(
            $.PRO_SPRITE,
            $.QUE_BACKGROUND,
            $.MOD_TEST
        )
    ])],
    [$.BLU_CHILDREN, new SafeSet()]
])];

export const blueprint = new SafeMap([
    [$.SCN_TEST, () => new SafeMap([
        [$.BLU_ENTITIES, new SafeMap([
            createPlayer(),
            createGround(),
            createTachie(),
            createTest()
        ])],
        [$.BLU_PROCESSES, new SafeSet([
            processMotion,
            processAnimation,
            processCamera,
            processPlayer
        ])]
    ])]
]);
