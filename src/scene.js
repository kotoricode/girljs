import * as $ from "./const";
import { Sprite } from "./components/sprite";
import { Space } from "./components/space";
import { Entity } from "./entity";
import { render } from "./gl/renderer";
import { getViewProjection } from "./math/camera";

export class Scene
{
    constructor(blueprint)
    {
        this.dt = 0;
        this.blueprint = blueprint;

        /** @const {Map<string, Entity>} */
        this.entities = new Map();

        /** @const {Map<number, Set>} */
        this.cached = new Map();

        this.root = new Entity($.ENTITY_ROOT);
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

        this.hasDirty = true;
        this.hasNewSprites |= (entity.flags & Sprite.flag);
    }

    // addGround()
    // {
    //     const entity = createGround();
    //     this.addEntity(entity);
    // }

    // addPlayer()
    // {
    //     const entity = createPlayer();
    //     this.addEntity(entity);
    // }

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
        if (this.entities.has(entityId))
        {
            return this.entities.get(entityId);
        }

        throw entityId;
    }

    initNewSprites()
    {
        const viewProjection = getViewProjection();

        for (const [sprite, space] of this.all(Sprite, Space))
        {
            if (!sprite.isInitialized)
            {
                sprite.setUniformIndex($.U_TRANSFORM, 1, space.matrix);
                sprite.setUniformIndex($.U_VIEWPROJECTION, 1, viewProjection);

                sprite.isInitialized = true;
            }
        }

        this.hasNewSprites = false;
    }

    load()
    {
        const bp = this.blueprint();
        this.processes = bp.processes;
        this.loadEntities(bp.entities);
    }

    loadEntities(entities, parentId)
    {
        for (const [entityId, entityObj] of Object.entries(entities))
        {
            const entity = new Entity(entityId, ...entityObj.components);
            this.addEntity(entity, parentId);

            if (entity.children)
            {
                this.loadEntities(entity.children, entityId);
            }
        }
    }

    markDirty(space)
    {
        // TODO: put dirty spaces into list (instead of .isDirty)
        // iterate list
        // for each space, check if still dirty
        // id dirty, go through ancestors to find topmost dirty
        // for that ancestor, walk through descendants and clean
        space.isDirty = true;
        this.hasDirty = true;
    }

    one(entityId, ...components)
    {
        const entity = this.getEntity(entityId);

        return Scene.yieldComponents(entity, components);
    }

    unload()
    {
        console.log("unload");
    }

    update(dt)
    {
        this.dt = dt;

        if (this.hasNewSprites)
        {
            // Connect new sprites' uniforms to transforms
            this.initNewSprites();
        }

        if (this.hasDirty)
        {
            // Set new spaces' world transforms from scenegraph
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
        if (!this.hasDirty)
        {
            throw Error;
        }

        for (const child of this.root.children)
        {
            this.updateSpaces(child);
        }

        this.hasDirty = false;
    }

    updateSpaces(entity, isAncestorDirty, parentMatrix)
    {
        const space = entity.getComponent(Space);
        const { matrix, world } = space;
        const isDirty = isAncestorDirty || space.isDirty;

        if (isDirty)
        {
            matrix.fromTransform(space.local);

            if (parentMatrix)
            {
                matrix.multiplyTransformMatrix(parentMatrix);
            }

            // TODO: rotation, scale
            world.translation.set(matrix[12], matrix[13], matrix[14]);

            space.isDirty = false;
        }

        for (const child of entity.children)
        {
            this.updateSpaces(child, isDirty, parentMatrix);
        }
    }
}
