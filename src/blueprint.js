import * as $ from "./const";

import { Ground }   from "./components/ground";
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
import { processHitboxes }  from "./processes/process-hitboxes";
import { processUi }        from "./processes/process-ui";

const createEntity = (entityId, ...components) => [
    entityId,
    new Map([
        [$.BLU_COMPONENTS, new Set(components)]
    ])
];

const createEntityChildren = (entityId, children, ...components) => [
    entityId,
    new Map([
        [$.BLU_COMPONENTS, new Set(components)],
        [$.BLU_ENTITIES, new Set(children)]
    ])
];

const createPlayer = () => createEntityChildren(
    $.ENT_PLAYER,
    [],//[createMonkey],
    new Space(0, 0, -1),
    new Drawable($.PRG_WORLD, $.QUE_SPRITE, $.MDL_GIRL_IDLE_00),
    new HitBox(-0.375, 0.375, 0, 1.5, -0.1, 0.1),
    new Motion(2.5),
    new Player(),
    new Anim(
        new Map([
            [$.ANI_IDLE, [$.MDL_GIRL_IDLE_00]],
            [$.ANI_MOVE, [
                $.MDL_GIRL_MOVE_00, $.MDL_GIRL_MOVE_01
            ]],
        ]),
        new Map([
            [$.ANI_IDLE, [Infinity]],
            [$.ANI_MOVE, [0.07]],
        ])
    )
);

const createHome = () => createEntity(
    $.ENT_GROUND,
    new Space(),
    new Drawable($.PRG_WORLD, $.QUE_BACKGROUND, $.MDL_HOME),
    new HitBox(-0.5, 0.5, 0, 2, -0.5, 0.5),
    new Ground(-3 + 0.375, 3 - 0.375, -2.6, 0),
);

const createWaypoint = () => createEntity(
    $.ENT_WAYPOINT,
    new Space(),
    new Motion(Infinity),
    new Drawable($.PRG_WORLD, $.QUE_WAYPOINT, $.MDL_WAYPOINT)
);

const createMonkey = () => createEntity(
    Symbol(),
    new Space(0, 0, 0),
    new Drawable($.PRG_WORLD, $.QUE_BACKGROUND, $.MDL_MONKEY)
);

export const blueprint = new Map([
    [$.SCN_TEST, new Map([
        [$.BLU_ENTITIES, new Set([
            createPlayer,
            //createMonkey,
            createWaypoint,
            createHome
        ])],
        [$.BLU_PROCESSES, new Set([
            processUi,
            processPlayer,
            processMotion,
            processHitboxes,
            processAnimation,
            processCamera,
        ])]
    ])]
]);
