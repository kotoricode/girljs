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

    addEntity(entity, parentId)
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

        if (entity.hasComponent(Space))
        {
            const space = entity.getComponent(Space);
            this.dirty.add(space);

            if (entity.hasComponent(Drawable))
            {
                const drawable = entity.getComponent(Drawable);

                const { programData } = drawable;

                if (programData.hasStaging($.U_TRANSFORM))
                {
                    programData.stageUniformAtIndex(
                        $.U_TRANSFORM,
                        1,
                        space.matrix
                    );
                }

                if (programData.hasStaging($.U_UVOFFSET) &&
                    programData.hasStaging($.U_UVREPEAT))
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

            matrix.composeFrom(space.local);

            if (parentMatrix)
            {
                matrix.multiplyTransform(parentMatrix);
            }

            space.world.decomposeFrom(matrix);

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

    // TODO: is there anything gc can't handle for us?
    unload()
    {
        this.dirty.clear();
        this.entities.clear();

        for (const cache of this.cached.values())
        {
            cache.clear();
        }

        this.cached.clear();

        for (const entity of this.entities.values())
        {
            entity.childIds.clear();
            entity.parent = null;
            entity.components.clear();
        }
    }

    update(dt)
    {
        this.dt = dt;

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
