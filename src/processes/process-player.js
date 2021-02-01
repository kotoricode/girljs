import * as $ from "../const";
import { Mouse } from "../dom";
import { Camera } from "../camera";
import { HitBox } from "../components/hitbox";
import { Ray } from "../math/ray";
//import { Dialogue } from "../dialogue";
import { Motion } from "../components/motion";
import { Scene } from "../scene";
import { Entity } from "../entity";
import { SafeMap, SafeSet } from "../utility";
import { Drawable } from "../components/drawable";
import { Space } from "../components/space";

const sym = Symbol();
const symEntity = new Entity(sym);

const symDrawable = new Drawable(
    $.PRG_UI,
    $.QUE_UI,
    $.MDL_AV_PLAYER,
    new SafeMap([
        [$.U_COLOR, [1, 0.871, 0.855, 1]]
    ])
);

const comps = new SafeSet([
    new Space(0.75, -0.2, 0),
    symDrawable
]);

export const processPlayer = () =>
{
    if (Mouse.isWorldClick)
    {
        // Dialogue.setText(
        //     "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
        // );

        const [ground] = Scene.one($.ENT_GROUND, HitBox);
        const ivp = Camera.getInvViewProjection();

        ray.numHits = 0;
        ray.fromMouse(ivp, Mouse.clip);
        ray.collide(ground);

        if (ray.numHits)
        {
            const [plMotion] = Scene.one($.ENT_PLAYER, Motion);

            const hit = ray.hit[0];
            plMotion.setMainTarget(hit);
        }

        if (!Scene.hasEntity(sym))
        {
            symEntity.addComponent(...comps);
            Scene.addEntity(symEntity, $.ENT_ROOT);
        }
        else
        {
            symDrawable.isVisible = !symDrawable.isVisible;
        }
    }
};

const ray = new Ray(0, 0, 0, 0, 0, 1);
