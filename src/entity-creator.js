import { Entity } from "./entity";
import { canvasAspect } from "./dom";

import { Transform } from "./components/transform";
import { Camera } from "./components/camera";
import { Motion } from "./components/motion";
import { Player } from "./components/player";
import { Drawable } from "./components/drawable";
import { Ground } from "./components/ground";

import * as $ from "./const";

const initModelPosUv = (draw) =>
{
    draw.initProgramData({
        [$.A_POSITION]: draw.model.meshOffset,
        [$.A_UV]: draw.model.uvOffset
    });
};

export const createPlayer = () =>
{
    const transform = new Transform();

    const mot = new Motion(300);
    const player = new Player();

    const draw = new Drawable(
        $.PROGRAM_SPRITE,
        $.TEXTURE_SPRITE,
        $.MODEL_PLAYER
    );

    initModelPosUv(draw);

    const entity = new Entity($.ENTITY_PLAYER);
    entity.addComponent(transform, draw, player, mot);

    return entity;
};

export const createCamera = () =>
{
    const transform = new Transform(0, 0, 2);

    const cam = new Camera(300, canvasAspect, 1, 3);

    const entity = new Entity($.ENTITY_CAMERA);
    entity.addComponent(transform, cam);

    return entity;
};

export const createGround = () =>
{
    const transform = new Transform();

    const draw = new Drawable(
        $.PROGRAM_TILED,
        $.TEXTURE_POLY,
        $.MODEL_GROUND
    );

    initModelPosUv(draw);

    draw.setUniform($.U_UVREPEAT, [5, 2]);
    draw.setUniform($.U_COLOR, [1, 0.7, 1, 1]);

    const ground = new Ground(-300, 300, -300, 300);

    const entity = new Entity($.ENTITY_GROUND);
    entity.addComponent(transform, draw, ground);

    return entity;
};
