import { Entity } from "./entity";

import { Transform } from "./components/transform";
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

export const createGround = () =>
{
    const transform = new Transform(),
          ground = new Ground(-300, 300, -300, 300),
          sprite = new Sprite(
              $.PROGRAM_TILED,
              $.MODEL_GROUND,
              new Map([
                  [$.U_UVREPEAT, [5, 5]],
                  [$.U_COLOR, [1, 0.7, 0.5, 1]]
              ])
          );

    return new Entity($.ENTITY_GROUND, transform, ground, sprite);
};
