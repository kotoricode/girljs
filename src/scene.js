import * as $ from "./const";
import { Drawable } from "./components/drawable";
import { Space } from "./components/space";
import { Entity } from "./entity";
import { render } from "./gl/renderer";
import { blueprint } from "./blueprint";
import { SafeMap, SafeSet } from "./utility";
import { Model } from "./gl/model";

export class Scene
{
    constructor(sceneId)
    {
        this.sceneId = sceneId;
        this.dt = 0;
        this.entities = new SafeMap();
        this.newDrawables = new SafeSet();

        /** @const {Map<number, Set>} */
        this.cached = new SafeMap();

        this.dirty = new SafeSet();
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

    addEntity(entity, parentId=this.root.id)
    {
        const parent = this.getEntity(parentId);

        parent.addChildId(entity.id);
        this.entities.set(entity.id, entity);

        for (const [flags, cache] of this.cached)
        {
            if (entity.hasFlags(flags))
            {
                cache.add(entity);
            }
        }

        if (entity.hasFlags(Space.flag))
        {
            const space = entity.getComponent(Space);
            this.dirty.add(space);
        }

        if (entity.hasFlags(Drawable.flag))
        {
            this.newDrawables.add(entity);
        }
    }

    * all(...components)
    {
        for (const entity of this.getEntitiesWith(components))
        {
            yield Scene.yieldComponents(entity, components);
        }
    }

    cleanGraph()
    {
        for (const childId of this.root.childIds)
        {
            this.cleanSpaces(childId);
        }
    }

    cleanSpaces(entityId, isAncestorDirty, parentMatrix)
    {
        const entity = this.getEntity(entityId);
        const space = entity.getComponent(Space);
        const isDirty = isAncestorDirty || this.dirty.has(space);

        if (isDirty)
        {
            const { matrix } = space;

            matrix.fromTransform(space.local);

            if (parentMatrix)
            {
                matrix.multiplyTransformMatrix(parentMatrix);
            }

            // TODO: rotation, scale
            space.world.translation.setValues(
                matrix[12],
                matrix[13],
                matrix[14]
            );

            if (this.dirty.has(space))
            {
                this.dirty.delete(space);
            }
        }

        for (const childId of entity.childIds)
        {
            this.cleanSpaces(childId, isDirty, parentMatrix);
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

    initNewDrawables()
    {
        for (const entity of this.newDrawables)
        {
            const [drawable, space] = entity.getComponents(Drawable, Space);
            const { programData } = drawable;
            const { staging } = programData;

            if (staging.has($.U_TRANSFORM))
            {
                programData.stageUniformAtIndex(
                    $.U_TRANSFORM,
                    1,
                    space.matrix
                );
            }

            if (staging.has($.U_UVOFFSET) && staging.has($.U_UVREPEAT))
            {
                const [
                    uvMinX, uvMaxY,
                    uvMaxX, ,
                    , uvMinY
                ] = Model.getUv(drawable.modelId);

                const width = uvMaxX - uvMinX;
                const height = uvMaxY - uvMinY;

                programData.stageUniform($.U_UVOFFSET, [uvMinX, uvMinY]);
                programData.stageUniform($.U_UVSIZE, [width, height]);
            }
        }
    }

    load()
    {
        this.root = new Entity($.ENTITY_ROOT);
        this.entities.set(this.root.id, this.root);

        const bp = blueprint.get(this.sceneId)();
        this.processes = bp.get($.BP_PROCESSES);
        const entities = bp.get($.BP_ENTITIES);
        this.loadEntities(entities, this.root.id);
    }

    loadEntities(entities, parentId)
    {
        for (const [entityId, entityBp] of entities)
        {
            const components = entityBp.get($.BP_COMPONENTS);
            const entity = new Entity(entityId, parentId, ...components);
            this.addEntity(entity, parentId);

            if (entityBp.has($.BP_CHILDREN))
            {
                const children = entityBp.get($.BP_CHILDREN);

                if (children)
                {
                    this.loadEntities(children, entityId);
                }
            }
        }
    }

    markDirty(space)
    {
        this.dirty.add(space);
    }

    one(entityId, ...components)
    {
        const entity = this.getEntity(entityId);

        return Scene.yieldComponents(entity, components);
    }

    unload()
    {
        this.dirty.clear();
        this.entities.clear();

        for (const cache of this.cached.values())
        {
            cache.clear();
        }

        this.cached.clear();
        this.newDrawables.clear();

        this.unloadEntities(this.root);
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

        if (this.newDrawables.size)
        {
            this.initNewDrawables();
            this.newDrawables.clear();
        }

        if (this.dirty.size)
        {
            // Set new spaces' world transforms from scenegraph
            // TODO: needs to be thoroughly tested
            // TODO: no need to update the entire graph
            this.cleanGraph();
        }

        for (const process of this.processes)
        {
            process(this);
        }

        // TODO: check for lost context
        // https://www.khronos.org/webgl/wiki/HandlingContextLost
        render(this);
    }

    * yieldGraph()
    {
        for (const child of this.root.childIds)
        {
            yield Scene.walkEntities(child);
        }
    }
}
