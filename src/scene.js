import * as $ from "./const";
import { Drawable } from "./components/drawable";
import { Space } from "./components/space";
import { Entity } from "./entity";
import { render } from "./gl/renderer";
import { SafeMap, SafeSet } from "./utility";
import { blueprint } from "./blueprint";

export const Scene = {
    addEntity(entity, parentId)
    {
        for (const [flags, cache] of cached)
        {
            if (entity.hasFlags(flags))
            {
                cache.add(entity);
            }
        }

        if (entity.has(Space))
        {
            const parent = Scene.getEntity(parentId);

            if (!parent.has(Space)) throw parentId;

            const parentSpace = parent.get(Space);
            const space = entity.get(Space);

            space.attachTo(parentSpace);

            entities.set(entity.id, entity);

            if (entity.has(Drawable))
            {
                const drawable = entity.get(Drawable);

                const { program } = drawable;

                if (program.hasStaging($.U_TRANSFORM))
                {
                    program.stageUniformAtIndex(
                        $.U_TRANSFORM,
                        1,
                        space.matrix
                    );
                }
            }

            dirty.add(space);
            this.cleanAll();
        }
    },
    * all(...components)
    {
        for (const entity of getEntitiesWith(components))
        {
            yield yieldComponents(entity, components);
        }
    },
    cleanAll()
    {
        for (const child of rootSpace.children)
        {
            Scene.cleanSpace(child);
        }
    },
    cleanSpace(space, isAncestorDirty, parentMatrix)
    {
        const isSelfDirty = dirty.has(space);
        const isDirty = isAncestorDirty || isSelfDirty;

        if (isDirty)
        {
            const { matrix } = space;

            matrix.composeFrom(space.local);

            if (parentMatrix)
            {
                matrix.multiplyTransform(parentMatrix);
            }

            space.world.decomposeFrom(matrix);

            if (isSelfDirty)
            {
                dirty.delete(space);
            }
        }

        for (const childSpace of space.children)
        {
            Scene.cleanSpace(childSpace, isDirty, parentMatrix);
        }
    },
    deleteEntity(entityId)
    {
        const entity = entities.get(entityId);

        for (const [flags, cache] of cached)
        {
            if (entity.hasFlags(flags))
            {
                cache.delete(entity);
            }
        }

        entities.delete(entityId);
    },
    getEntity(entityId)
    {
        return entities.get(entityId);
    },
    hasEntity(entityId)
    {
        return entities.has(entityId);
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
        const bpProcesses = bp.get($.BLU_PROCESSES);
        const bpEntities = bp.get($.BLU_ENTITIES);

        for (const process of bpProcesses)
        {
            processes.add(process);
        }

        createBlueprintEntities(bpEntities, root.id);
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
        for (const process of processes)
        {
            process(dt);
        }

        // TODO: check for lost context
        // https://www.khronos.org/webgl/wiki/HandlingContextLost
        render();
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

const createBlueprintEntities = (bpEntities, parentId) =>
{
    for (const [entityId, entityBp] of bpEntities)
    {
        const components = entityBp.get($.BLU_COMPONENTS);
        const entity = new Entity(entityId);
        entity.set(...components);
        Scene.addEntity(entity, parentId);

        if (entityBp.has($.BLU_CHILDREN))
        {
            const children = entityBp.get($.BLU_CHILDREN);

            if (children)
            {
                createBlueprintEntities(children, entityId);
            }
        }
    }
};

function* yieldComponents(entity, components)
{
    for (const comp of components)
    {
        yield entity.get(comp);
    }
}

const cached = new SafeMap();
const dirty = new SafeSet();

const entities = new SafeMap();
const processes = new SafeSet();

const rootSpace = new Space();
const root = new Entity($.ENT_ROOT);
root.set(rootSpace);
