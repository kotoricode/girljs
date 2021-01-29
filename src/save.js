import * as $ from "./const";
import { isNullOrUndefined, Storage } from "./utility";

export const Prefs = {
    get(prefId)
    {
        assertHasKey(prefId);

        return prefs[prefId];
    },
    load()
    {
        for (const key of Object.keys(prefs))
        {
            const stored = Storage.get(key);

            if (!isNullOrUndefined(stored))
            {
                prefs[key] = stored;
            }
        }
    },
    save()
    {
        for (const [key, value] of Object.entries(prefs))
        {
            Storage.set(key, value);
        }
    },
    set(prefId, value)
    {
        assertHasKey(prefId);

        prefs[prefId] = value;
    }
};

const assertHasKey = (prefId) =>
{
    if (!(prefId in prefs)) throw Error;
};

const prefs = {
    [$.PREF_MASTER]: 0.66,
    [$.PREF_MUSIC]: 0.66,
    [$.PREF_SOUND]: 0.66,
};

const state = {

};

Prefs.load();
