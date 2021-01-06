import * as $ from "./const";
import { getStored, setStored } from "./utils/storage";

export const getPref = (prefId) =>
{
    if (prefId in prefs)
    {
        return prefs[prefId];
    }

    throw prefId;
};

export const prefsFromStored = () =>
{
    for (const key of Object.keys(prefs))
    {
        const stored = getStored(key);

        if (stored !== null)
        {
            prefs[key] = stored;
        }
    }
};

export const prefsToStored = () =>
{
    for (const [key, value] of Object.entries(prefs))
    {
        setStored(key, value);
    }
};

export const setPref = (prefId, value) =>
{
    if (!(prefId in prefs))
    {
        throw prefId;
    }

    prefs[prefId] = value;
};

const prefs = {
    [$.PREF_MASTER]: 0.66,
    [$.PREF_MUSIC]: 0.66,
    [$.PREF_SOUND]: 0.66,
};

const state = {

};

prefsFromStored();
