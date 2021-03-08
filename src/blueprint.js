import * as $ from "./const";
import { SafeMap, SafeSet } from "./utility";

import { Space }    from "./components/space";
import { Motion }   from "./components/motion";
import { Player }   from "./components/player";
import { Drawable } from "./components/drawable";
import { HitBox }   from "./components/hitbox";
import { Anim }     from "./components/anim";

import { processMotion }    from "./processes/process-motion";
import { processCameraPosition }    from "./processes/process-camera-position";
import { processAnimation } from "./processes/process-animation";
import { processPlayer }    from "./processes/process-player";
import { Ground } from "./components/ground";
import { processHitboxes } from "./processes/process-hitboxes";
import { processCameraRay } from "./processes/process-camera-ray";
import { processUi } from "./processes/process-ui";

const createPlayer = () => [$.ENT_PLAYER, new SafeMap([
    [$.BLU_COMPONENTS, new SafeSet([
        new Space(0, 0, -1),
        new Drawable($.PRG_WORLD, $.QUE_SPRITE, $.MDL_GIRL_IDLE_00),
        new HitBox(-0.375, 0.375, 0, 1.5, -0.1, 0.1),
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
        //createMonkey()
    ])]
])];

const createHome = () => [$.ENT_GROUND, new SafeMap([
    [$.BLU_COMPONENTS, new SafeSet([
        new Space(),
        new Drawable($.PRG_WORLD, $.QUE_BACKGROUND, $.MDL_HOME),
        new HitBox(-0.5, 0.5, 0, 2, -0.5, 0.5),
        new Ground(-3 + 0.375, 3 - 0.375, -2.6, 0),
    ])],
    [$.BLU_CHILD_ENTITIES, new SafeMap()]
])];

const createMonkey = () => [Symbol(), new SafeMap([
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
            processUi,
            processMotion,
            processCameraPosition,
            processHitboxes,
            processCameraRay,
            processAnimation,
            processPlayer,
        ])]
    ])]
]);
