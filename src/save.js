import * as $ from "./const";
import { Storage } from "./utils/storage";

export const Prefs = {
    get(prefId)
    {
        if (!(prefId in prefs)) throw Error;

        return prefs[prefId];
    },
    load()
    {
        for (const key of Object.keys(prefs))
        {
            const stored = Storage.get(key);

            if (stored !== null)
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
        if (!(prefId in prefs)) throw Error;

        prefs[prefId] = value;
    }
};

const prefs = {
    [$.PREF_MASTER]: 0.66,
    [$.PREF_MUSIC]: 0.66,
    [$.PREF_SOUND]: 0.66,
};

const state = {

};

Prefs.load();
