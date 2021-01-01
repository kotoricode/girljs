
import { Camera } from "./components/camera";
import { Drawable } from "./components/drawable";
import { Transform } from "./components/transform";
import { Entity } from "./entity";
import {
    createCamera,
    createGround,
    createPlayer
} from "./entity-creator";
import { render } from "./renderer";

import * as CONST from "./const";

export class Scene
{
    constructor(processes)
    {
        this.dt = 0;
        this.processes = processes;

        /** @const {Map<string, Entity>} */
        this.entities = new Map();

        this.cached = new Map();
        this.root = new Entity(CONST.ENTITY_ROOT);

        this.addCam();
        this.addGround();
        this.addPlayer();
    }

    static * yieldComponents(entity, comps)
    {
        for (const comp of comps)
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
        this.hasNewDrawables |= (entity.flags & Drawable.flag);
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

    getEntity(id)
    {
        if (!this.entities.has(id))
        {
            throw id;
        }

        return this.entities.get(id);
    }

    * all(...comps)
    {
        for (const entity of this.getEntities(comps))
        {
            yield Scene.yieldComponents(entity, comps);
        }
    }

    initDrawables()
    {
        if (this.hasNewDrawables)
        {
            const camEntity = this.getEntity(CONST.ENTITY_CAMERA);
            const cam = camEntity.getComponent(Camera);

            for (const [draw, transform] of this.all(Drawable, Transform))
            {
                if (draw.isInitialized)
                {
                    continue;
                }

                draw.setUniformIndex(CONST.U_MODEL, 1, transform.matrix);
                draw.setUniformIndex(CONST.U_VP, 1, cam.viewProjection);
                draw.isInitialized = true;
            }

            this.hasNewDrawables = false;
        }
    }

    one(id, ...comps)
    {
        const entity = this.getEntity(id);

        return Scene.yieldComponents(entity, comps);
    }

    update(dt)
    {
        this.dt = dt;
        this.initDrawables();

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
