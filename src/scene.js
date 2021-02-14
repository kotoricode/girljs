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
        console.log("clean all");
        for (const child of rootSpace.children)
        {
            Scene.cleanSpace(child);
        }
    },
    cleanSpace(space, isAncestorDirty, parentMatrix)
    {
        const isSelfDirty = dirty.has(space);
        const isDirty = isAncestorDirty || isSelfDirty;
        const { matrix } = space;

        if (isDirty)
        {
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
            Scene.cleanSpace(childSpace, isDirty, matrix);
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
    getPreviousScene()
    {
        return previousScene;
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
    setPendingLoad(sceneId)
    {
        nextScene = sceneId;
    },
    update(dt)
    {
        if (Mouse.isClickPending())
        {
            Mouse.setClick();
        }

        if (isSet(nextScene))
        {
            previousScene = currentScene;
            currentScene = nextScene;
            nextScene = null;

            this.load(currentScene);
        }

        for (const process of processes)
        {
            process(dt);
        }

        if (Mouse.isClick())
        {
            Mouse.consumeClick();
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

const createBlueprintEntities = (bpEntities, parentId) =>
{
    for (const [entityId, entityBp] of bpEntities)
    {
        const components = entityBp.get($.BLU_COMPONENTS);
        const entity = new Entity(entityId);
        entity.set(...components);
        console.log(`${parentId} > ${entity.id}`);
        Scene.addEntity(entity, parentId);

        const children = entityBp.get($.BLU_CHILDREN);

        if (children.size)
        {
            createBlueprintEntities(children, entityId);
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
