export const Storage = {
    get(key)
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
    },
    set(key, value)
    {
        const json = JSON.stringify(value);
        storage.setItem(key, json);
    }
};

const storage = window.localStorage;
