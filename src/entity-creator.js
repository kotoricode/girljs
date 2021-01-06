import * as $ from "./const";
import { Entity } from "./entity";
import { BoxCollider } from "./math/box-collider";
import { Space } from "./components/space";
import { Motion } from "./components/motion";
import { Player } from "./components/player";
import { Sprite } from "./components/sprite";
import { Collider } from "./components/collider";

export const createPlayer = () =>
{
    const space = new Space(),
          mot = new Motion(300),
          player = new Player(),
          sprite = new Sprite($.PROGRAM_SPRITE, $.MODEL_PLAYER2);

    return new Entity($.ENTITY_PLAYER, space, sprite, player, mot);
};

export const createGround = () =>
{
    const space = new Space(),
          collider = new Collider(new BoxCollider(-300, -300, 600, 600)),
          //ground = new Ground(-300, 300, -300, 300),
          sprite = new Sprite(
              $.PROGRAM_TILED,
              $.MODEL_GROUND,
              {
                  [$.U_UVREPEAT]: [5, 5],
                  [$.U_COLOR]: [1, 0.7, 0.5, 1]
              }
          );

    return new Entity($.ENTITY_GROUND, space, collider, sprite);
};
