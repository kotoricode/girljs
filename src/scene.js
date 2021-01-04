
import { Camera } from "./components/camera";
import { Sprite } from "./components/sprite";
import { Transform } from "./components/transform";
import { Entity } from "./entity";
import {
    createCamera,
    createGround,
    createPlayer
} from "./entity-creator";
import { render } from "./renderer";

import * as $ from "./const";

export class Scene
{
    constructor(processes)
    {
        this.dt = 0;
        this.processes = processes;

        /** @const {Map<string, Entity>} */
        this.entities = new Map();

        /** @const {Map<number, Set>} */
        this.cached = new Map();

        this.root = new Entity($.ENTITY_ROOT);

        this.addCam();
        this.addGround();
        this.addPlayer();
    }

    static * yieldComponents(entity, components)
    {
        for (const comp of components)
        {
            yield entity.components.get(comp);
        }
    }

    addCam()
    {
        const entity = createCamera();
        this.addEntity(entity);
    }

    addPlayer()
    {
        const entity = createPlayer();
        this.addEntity(entity);
    }

    addGround()
    {
        const entity = createGround();
        this.addEntity(entity);
    }

    addEntity(entity, parent=this.root)
    {
        parent.addChild(entity);
        this.entities.set(entity.id, entity);

        for (const [flags, cache] of this.cached)
        {
            if (entity.hasFlags(flags))
            {
                cache.add(entity);
            }
        }

        this.isGraphDirty = true;
        this.hasNewSprites |= (entity.flags & Sprite.flag);
    }

    getEntities(components)
    {
        let flags = 0;

        for (const comp of components)
        {
            flags += comp.flag;
        }

        if (!this.cached.has(flags))
        {
            const cache = new Set();

            for (const entity of this.entities.values())
            {
                if (entity.hasFlags(flags))
                {
                    cache.add(entity);
                }
            }

            this.cached.set(flags, cache);
        }

        return this.cached.get(flags);
    }

    getEntity(entityId)
    {
        if (!this.entities.has(entityId))
        {
            throw entityId;
        }

        return this.entities.get(entityId);
    }

    * all(...components)
    {
        for (const entity of this.getEntities(components))
        {
            yield Scene.yieldComponents(entity, components);
        }
    }

    initSprites()
    {
        if (this.hasNewSprites)
        {
            const camEntity = this.getEntity($.ENTITY_CAMERA);
            const cam = camEntity.getComponent(Camera);

            for (const [sprite, transform] of this.all(Sprite, Transform))
            {
                if (!sprite.isInitialized)
                {
                    sprite.setUniformIndex(
                        $.U_TRANSFORM,
                        1,
                        transform.matrix
                    );

                    sprite.setUniformIndex(
                        $.U_VIEWPROJECTION,
                        1,
                        cam.viewProjection
                    );

                    sprite.isInitialized = true;
                }
            }

            this.hasNewSprites = false;
        }
    }

    one(entityId, ...components)
    {
        const entity = this.getEntity(entityId);

        return Scene.yieldComponents(entity, components);
    }

    update(dt)
    {
        this.dt = dt;
        this.initSprites();

        for (const process of this.processes)
        {
            process(this);
        }

        render(this);
    }

    updateGraph()
    {
        for (const entity of this.root.below)
        {
            this.updateTransform(entity);
        }

        this.isGraphDirty = false;
    }

    updateTransform(entity, isInheritDirty, parentTransform)
    {
        const transform = entity.getComponent(Transform);

        const isDirty = isInheritDirty || transform.isDirty;

        if (isDirty)
        {
            const matrix = transform.matrix;

            matrix.fromTransform(transform);

            if (parentTransform)
            {
                matrix.multiplyTransform(parentTransform.matrix);
            }

            transform.world.translation.set(
                matrix[12],
                matrix[13],
                matrix[14]
            );

            transform.isDirty = false;
        }

        for (const child of entity.below)
        {
            this.updateTransform(child, isDirty, transform);
        }
    }
}
