import { Sprite } from "./components/sprite";
import { Transform } from "./components/transform";
import { Entity } from "./entity";
import {
    createGround,
    createPlayer
} from "./entity-creator";
import { render } from "./renderer";

import * as $ from "./const";
import { getViewProjection } from "./camera";

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

    static * yieldGraph(entity)
    {
        yield entity;

        for (const child of entity.children)
        {
            yield Scene.yieldGraph(child);
        }
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

        this.isDirty = true;
        this.hasNewSprites |= (entity.flags & Sprite.flag);
    }

    * all(...components)
    {
        for (const entity of this.getEntitiesWith(components))
        {
            yield Scene.yieldComponents(entity, components);
        }
    }

    getEntitiesWith(components)
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

    * getEntitiesOrdered(entity=this.root)
    {
        yield entity;

        for (const child of entity.children)
        {
            yield this.getEntitiesOrdered(child);
        }
    }

    getEntity(entityId)
    {
        if (!this.entities.has(entityId))
        {
            throw entityId;
        }

        return this.entities.get(entityId);
    }

    initNewSprites()
    {
        const viewProjection = getViewProjection();

        for (const [sprite, transform] of this.all(Sprite, Transform))
        {
            if (!sprite.isInitialized)
            {
                sprite.setUniformIndex($.U_TRANSFORM, 1, transform.matrix);
                sprite.setUniformIndex($.U_VIEWPROJECTION, 1, viewProjection);

                sprite.isInitialized = true;
            }
        }

        this.hasNewSprites = false;
    }

    one(entityId, ...components)
    {
        const entity = this.getEntity(entityId);

        return Scene.yieldComponents(entity, components);
    }

    update(dt)
    {
        this.dt = dt;

        if (this.hasNewSprites)
        {
            // Connect new sprites' uniforms to transforms
            this.initNewSprites();
        }

        if (this.isDirty)
        {
            // Set new transforms' world transforms from scenegraph
            // TODO: needs to be thoroughly tested
            // TODO: no need to update the entire graph
            this.updateGraph();
        }

        for (const process of this.processes)
        {
            process(this);
        }

        render(this);
    }

    updateGraph()
    {
        if (!this.isDirty)
        {
            throw Error;
        }

        for (const child of this.root.children)
        {
            this.updateTransform(child);
        }

        this.isDirty = false;
    }

    updateTransform(entity, isAncestorDirty, parentMatrix)
    {
        const xform = entity.getComponent(Transform);
        const { matrix, world } = xform;
        const isDirty = isAncestorDirty || xform.isDirty;

        if (isDirty)
        {
            matrix.fromTransform(xform.local);

            if (parentMatrix)
            {
                matrix.multiplyTransform(parentMatrix);
            }

            // TODO: rotation, scale
            world.translation.set(matrix[12], matrix[13], matrix[14]);

            xform.isDirty = false;
        }

        for (const child of entity.children)
        {
            this.updateTransform(child, isDirty, parentMatrix);
        }
    }
}
