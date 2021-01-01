import { storage } from "./dom";
import * as CONST from "./const";
import { publish } from "./publisher";

const data = {
    [CONST.OPTION_MASTER]: 0.5,
    [CONST.OPTION_MUSIC]: 0.5,
    [CONST.OPTION_SOUND]: 0.5
};

export const getOption = (key) =>
{
    return data[key];
};

export const setOption = (key, value) =>
{
    data[key] = value;
    publish(key);
};

export const saveOptions = (...keys) =>
{
    for (const key of keys)
    {
        if (!(key in data))
        {
            throw ReferenceError();
        }

        const value = data[key];

        const json = JSON.stringify(value);
        storage.setItem(key, json);

        console.log(`[Options] Saved key:"${key}" value:"${value}"`);
    }
};

for (const key of Object.keys(data))
{
    const stored = storage.getItem(key);

    if (stored)
    {
        try
        {
            data[key] = JSON.parse(stored);
        }
        catch
        {
            console.warn(`Failed to parse ${key}: ${stored}`);
        }
    }
}
