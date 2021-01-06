const storage = window.localStorage;

export const getStored = (key) =>
{
    const data = storage.getItem(key);

    try
    {
        const parsed = JSON.parse(data);

        return parsed;
    }
    catch
    {
        throw key;
    }
};

export const setStored = (key, value) =>
{
    const json = JSON.stringify(value);

    storage.setItem(key, json);
};
