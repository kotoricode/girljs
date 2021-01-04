import { Entity } from "./entity";
import { canvasAspect } from "./dom";

import { Transform } from "./components/transform";
import { Camera } from "./components/camera";
import { Motion } from "./components/motion";
import { Player } from "./components/player";
import { Sprite } from "./components/sprite";
import { Ground } from "./components/ground";

import * as $ from "./const";

export const createPlayer = () =>
{
    const transform = new Transform(),
          mot = new Motion(300),
          player = new Player(),
          sprite = new Sprite($.PROGRAM_SPRITE, $.MODEL_PLAYER2);

    return new Entity($.ENTITY_PLAYER, transform, sprite, player, mot);
};

export const createCamera = () =>
{
    const transform = new Transform(0, 0, 2),
          cam = new Camera(300, canvasAspect, 1, 3);

    return new Entity($.ENTITY_CAMERA, transform, cam);
};

export const createGround = () =>
{
    const transform = new Transform(),
          ground = new Ground(-300, 300, -300, 300),
          sprite = new Sprite($.PROGRAM_TILED, $.MODEL_GROUND);

    sprite.setUniform($.U_UVREPEAT, [5, 5]);
    sprite.setUniform($.U_COLOR, [1, 0.7, 1, 1]);

    return new Entity($.ENTITY_GROUND, transform, ground, sprite);
};
