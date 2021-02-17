import * as $ from "./const";
import { Drawable } from "./components/drawable";
import { Space } from "./components/space";
import { Entity } from "./entity";
import { Renderer } from "./gl/renderer";
import { isSet, SafeMap, SafeSet } from "./utility";
import { blueprint } from "./blueprint";
import { Mouse } from "./dom";

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
            const parent = this.getEntity(parentId);

            if (!parent.has(Space)) throw parentId;

            const parentSpace = parent.get(Space);
            const space = entity.get(Space);

            space.attachTo(parentSpace);
            entities.set(entity.id, entity);

            if (entity.has(Drawable))
            {
                const drawable = entity.get(Drawable);

                const { program } = drawable;

                if (program.hasStagingUniform($.U_TRANSFORM))
                {
                    program.stageUniformAtIndex(
                        $.U_TRANSFORM,
                        1,
                        space.matrix
                    );
                }
            }

            dirty.add(space);
            cleanSpace(space, true);
        }
    },
    * all(...components)
    {
        for (const entity of getEntitiesWith(components))
        {
            yield yieldComponents(entity, components);
        }
    },
    clean()
    {
        if (dirty.size)
        {
            for (const space of dirty)
            {
                filterNontopDirty(space);
            }

            for (const space of dirty)
            {
                cleanSpace(space);
            }

            if (dirty.size) throw Error("Failed to clean all spaces");
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

        if (entity.has(Space))
        {
            const space = entity.get(Space);
            space.detach();

            if (dirty.has(space))
            {
                dirty.delete(space);
            }
        }
    },
    getEntity(entityId)
    {
        return entities.get(entityId);
    },
    getPreviousScene()
    {
        return previousScene;
    },
    hasEntity(entityId)
    {
        return entities.has(entityId);
    },
    markDirty(space)
    {
        dirty.add(space);
    },
    one(entityId, ...components)
    {
        const entity = this.getEntity(entityId);

        return yieldComponents(entity, components);
    },
    setPendingLoad(sceneId)
    {
        nextScene = sceneId;
    },
    update(dt)
    {
        Mouse.update();

        if (isSet(nextScene))
        {
            previousScene = currentScene;
            currentScene = nextScene;
            nextScene = null;

            load(currentScene);
        }

        for (const process of processes)
        {
            process(dt);
        }

        Renderer.render();
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

const cleanSpace = (space, isWorldUpdate) =>
{
    const { matrix, local, world, parent, children } = space;

    if (dirty.has(parent)) throw Error("Parent is dirty");

    const isSelfDirty = dirty.has(space);
    const isDirty = isWorldUpdate || isSelfDirty;

    if (isDirty)
    {
        matrix.composeFrom(local);

        if (isWorldUpdate)
        {
            matrix.multiplyTransform(parent.matrix);
        }

        world.decomposeFrom(matrix);

        if (isSelfDirty)
        {
            dirty.delete(space);
        }
    }

    for (const child of children)
    {
        cleanSpace(child, isDirty);
    }
};

const createBlueprintEntities = (bpEntities, parentId) =>
{
    for (const [entityId, entityBp] of bpEntities)
    {
        const components = entityBp.get($.BLU_COMPONENTS);
        const entity = new Entity(entityId);
        entity.set(...components);
        Scene.addEntity(entity, parentId);

        const children = entityBp.get($.BLU_CHILD_ENTITIES);

        if (children.size)
        {
            createBlueprintEntities(children, entityId);
        }
    }
};

const filterNontopDirty = (space) =>
{
    let currentDirty = space;
    let currentSpace = space;

    while (currentSpace !== rootSpace)
    {
        if (dirty.has(currentSpace.parent))
        {
            dirty.delete(currentDirty);
            currentDirty = currentSpace.parent;
        }

        currentSpace = currentSpace.parent;
    }
};

const load = (sceneId) =>
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
    const bpEntities = bp.get($.BLU_CHILD_ENTITIES);

    for (const process of bpProcesses)
    {
        processes.add(process);
    }

    createBlueprintEntities(bpEntities, root.id);
};

function* yieldComponents(entity, components)
{
    for (const comp of components)
    {
        yield entity.get(comp);
    }
}

let nextScene;
let currentScene;
let previousScene;

const cached = new SafeMap();
const dirty = new SafeSet();

const entities = new SafeMap();
const processes = new SafeSet();

const rootSpace = new Space();
const root = new Entity($.ENT_ROOT);
root.set(rootSpace);
