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
import { Ground } from "./components/ground";

const createPlayer = () => [$.ENT_PLAYER, new SafeMap([
    [$.BLU_COMPONENTS, new SafeSet([
        new Space(0, 0, -1),
        new Drawable($.PRG_WORLD, $.QUE_SPRITE, $.MDL_GIRL_IDLE_00),
        new Motion(3),
        new Player(),
        new Anim(
            new SafeMap([
                [$.ANI_IDLE, [$.MDL_GIRL_IDLE_00]],
                [$.ANI_MOVE, [
                    $.MDL_GIRL_MOVE_00, $.MDL_GIRL_MOVE_01
                ]],
            ]),
            new SafeMap([
                [$.ANI_IDLE, [Infinity]],
                [$.ANI_MOVE, [0.07]],
            ])
        )
    ])],
    [$.BLU_CHILD_ENTITIES, new SafeMap([
        createMonkey()
    ])]
])];

const createTest = () => ["Test", new SafeMap([
    [$.BLU_COMPONENTS, new SafeSet([
        new Space(),
        new Drawable($.PRG_WORLD, $.QUE_BACKGROUND, $.MDL_TEST)
    ])],
    [$.BLU_CHILD_ENTITIES, new SafeMap()]
])];

const createHome = () => [$.ENT_GROUND, new SafeMap([
    [$.BLU_COMPONENTS, new SafeSet([
        new Space(),
        new Drawable($.PRG_WORLD, $.QUE_BACKGROUND, $.MDL_HOME),
        new Ground(-3, 3, -2.6, 0),
    ])],
    [$.BLU_CHILD_ENTITIES, new SafeMap()]
])];

const createMonkey = () => ["Monkey", new SafeMap([
    [$.BLU_COMPONENTS, new SafeSet([
        new Space(0, 0, 0),
        new Drawable($.PRG_WORLD, $.QUE_BACKGROUND, $.MDL_MONKEY)
    ])],
    [$.BLU_CHILD_ENTITIES, new SafeMap()]
])];

export const blueprint = new SafeMap([
    [$.SCN_TEST, () => new SafeMap([
        [$.BLU_CHILD_ENTITIES, new SafeMap([
            createPlayer(),
            createHome()
        ])],
        [$.BLU_PROCESSES, new SafeSet([
            processMotion,
            processAnimation,
            processCamera,
            processPlayer
        ])]
    ])]
]);
