import * as $ from "./const";
import { Sprite } from "./components/sprite";
import { Space } from "./components/space";
import { Entity } from "./entity";
import { render } from "./gl/renderer";
import { blueprint } from "./blueprint";
import { SafeMap, SafeSet } from "./utils/safe-builtins";

export class Scene
{
    constructor(sceneId)
    {
        this.sceneId = sceneId;
        this.dt = 0;
        this.entities = new SafeMap();
        this.newSpriteEntities = new SafeSet();

        /** @const {Map<number, Set>} */
        this.cached = new SafeMap();

        // TODO: implement this
        this.dirtyEntities = new SafeSet();
    }

    static * walkEntities(entity)
    {
        yield entity;

        for (const child of entity.children)
        {
            yield Scene.walkEntities(child);
        }
    }

    static * yieldComponents(entity, components)
    {
        for (const comp of components)
        {
            yield entity.components.get(comp);
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

        if (entity.hasFlags(Sprite.flag))
        {
            this.newSpriteEntities.add(entity);
        }
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
            const cache = new SafeSet();

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
        return this.entities.get(entityId);
    }

    initNewSpriteUniforms()
    {
        for (const entity of this.newSpriteEntities)
        {
            const [sprite, space] = entity.getComponents(Sprite, Space);

            sprite.programData.stageUniformAtIndex(
                $.U_TRANSFORM,
                1,
                space.matrix
            );
        }
    }

    load()
    {
        this.root = new Entity($.ENTITY_ROOT);
        this.hasDirty = false;

        const bp = blueprint.get(this.sceneId)();
        this.processes = bp.processes;
        this.loadEntities(bp.entities);
    }

    loadEntities(entities, parentId)
    {
        for (const [entityId, entityObj] of entities)
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
        this.entities.clear();

        for (const cache of this.cached.values())
        {
            cache.clear();
        }

        this.cached.clear();
        this.newSpriteEntities.clear();

        this.unloadEntities(this.root);

        this.hasDirty = false;
    }

    unloadEntities(entity)
    {
        for (const child of entity.children)
        {
            this.unloadEntities(child);
        }

        entity.children.clear();
        entity.components.clear();
    }

    update(dt)
    {
        this.dt = dt;

        if (this.newSpriteEntities.size)
        {
            this.initNewSpriteUniforms();
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

        // TODO: check for lost context
        // https://www.khronos.org/webgl/wiki/HandlingContextLost
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
        const isDirty = isAncestorDirty || space.isDirty;

        if (isDirty)
        {
            const { matrix } = space;

            matrix.fromTransform(space.local);

            if (parentMatrix)
            {
                matrix.multiplyTransformMatrix(parentMatrix);
            }

            // TODO: rotation, scale
            space.world.translation.set(matrix[12], matrix[13], matrix[14]);

            space.isDirty = false;
        }

        for (const child of entity.children)
        {
            this.updateSpaces(child, isDirty, parentMatrix);
        }
    }

    * yieldGraph()
    {
        for (const child of this.root.children)
        {
            yield Scene.walkEntities(child);
        }
    }
}
