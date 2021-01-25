import * as $ from "./const";
import { Drawable } from "./components/drawable";
import { Space } from "./components/space";
import { Entity } from "./entity";
import { render } from "./gl/renderer";
import { SafeMap, SafeSet } from "./utility";
import { Model } from "./gl/model";
import { blueprint } from "./blueprint";

export const Scene = {
    * all(...components)
    {
        for (const entity of getEntitiesWith(components))
        {
            yield yieldComponents(entity, components);
        }
    },
    getEntity(entityId)
    {
        return entities.get(entityId);
    },
    load(sceneId)
    {
        /*----------------------------------------------------------------------
            Unload
        ----------------------------------------------------------------------*/
        dirty.clear();
        entities.clear();
        processes.clear();

        for (const cache of cached.values())
        {
            cache.clear();
        }

        cached.clear();

        for (const entity of entities.values())
        {
            entity.childIds.clear();
            entity.parent = null;
            entity.components.clear();
        }

        /*----------------------------------------------------------------------
            Load
        ----------------------------------------------------------------------*/
        entities.set(root.id, root);

        const bp = blueprint.get(sceneId)();
        const bpProcesses = bp.get($.BP_PROCESSES);
        const bpEntities = bp.get($.BP_ENTITIES);

        for (const process of bpProcesses)
        {
            processes.add(process);
        }

        loadEntities(bpEntities, root.id);
    },
    markDirty(space)
    {
        dirty.add(space);
    },
    one(entityId, ...components)
    {
        const entity = Scene.getEntity(entityId);

        return yieldComponents(entity, components);
    },
    update(dt)
    {
        // Pre-process cleanup (new entities etc)
        if (dirty.size)
        {
            cleanGraph();
        }

        for (const process of processes)
        {
            process(dt);
        }

        // Post-process cleanup (movement etc)
        if (dirty.size)
        {
            cleanGraph();
        }

        // TODO: check for lost context
        // https://www.khronos.org/webgl/wiki/HandlingContextLost
        render(Scene);
    }
};

const addEntity = (entity, parentId) =>
{
    const parent = Scene.getEntity(parentId);

    parent.addChildId(entity.id);
    entities.set(entity.id, entity);

    for (const [flags, cache] of cached)
    {
        if (entity.hasFlags(flags))
        {
            cache.add(entity);
        }
    }

    if (entity.hasComponent(Space))
    {
        const space = entity.getComponent(Space);
        dirty.add(space);

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
                ] = Model.getUv(drawable.programData.modelId);

                const width = uvMaxX - uvMinX;
                const height = uvMaxY - uvMinY;

                programData.stageUniform($.U_UVOFFSET, [uvMinX, uvMinY]);
                programData.stageUniform($.U_UVSIZE, [width, height]);
            }
        }
    }
};

const cleanGraph = () =>
{
    for (const childId of root.childIds)
    {
        cleanSpaces(childId);
    }
};

const cleanSpaces = (entityId, isAncestorDirty, parentMatrix) =>
{
    const entity = Scene.getEntity(entityId);
    const space = entity.getComponent(Space);
    const isDirty = isAncestorDirty || dirty.has(space);

    if (isDirty)
    {
        const { matrix } = space;

        matrix.composeFrom(space.local);

        if (parentMatrix)
        {
            matrix.multiplyTransform(parentMatrix);
        }

        space.world.decomposeFrom(matrix);

        if (dirty.has(space))
        {
            dirty.delete(space);
        }
    }

    for (const childId of entity.childIds)
    {
        cleanSpaces(childId, isDirty, parentMatrix);
    }
};

const getEntitiesWith = (components) =>
{
    let flags = 0;

    for (const comp of components)
    {
        flags += comp.flag;
    }

    if (!cached.has(flags))
    {
        const cache = new SafeSet();

        for (const entity of entities.values())
        {
            if (entity.hasFlags(flags))
            {
                cache.add(entity);
            }
        }

        cached.set(flags, cache);
    }

    return cached.get(flags);
};

const loadEntities = (bpEntities, parentId) =>
{
    for (const [entityId, entityBp] of bpEntities)
    {
        const components = entityBp.get($.BP_COMPONENTS);
        const entity = new Entity(entityId, parentId, ...components);
        addEntity(entity, parentId);

        if (entityBp.has($.BP_CHILDREN))
        {
            const children = entityBp.get($.BP_CHILDREN);

            if (children)
            {
                loadEntities(children, entityId);
            }
        }
    }
};

function* yieldComponents(entity, components)
{
    for (const comp of components)
    {
        yield entity.components.get(comp);
    }
}

const sceneId = sceneId;
const cached = new SafeMap();
const dirty = new SafeSet();

const entities = new SafeMap();
const processes = new SafeSet();

const root = new Entity($.ENTITY_ROOT);
