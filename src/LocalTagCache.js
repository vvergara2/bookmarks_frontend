export const getSavedTagCache = () => {
    let defaultCache = {};
    let savedTagCache = localStorage.getItem("tagCache");

    if (savedTagCache != null) {
        try {
            return JSON.parse(savedTagCache);
        } catch (e) {
            return defaultCache;
        }
    }

    return defaultCache;
}

export const saveTagCache = (tagCacheObject) => {
    try {
        localStorage.setItem("tagCache", JSON.stringify(tagCacheObject));
    } catch (error) {
        // HACK if there's no space for more tags, just dump the entire cache
        console.warn("LocalTagCache: no room in local storage, deleting tag cache");
        deleteTagCache();
    }
}

export const deleteTagCache = () => {
    localStorage.removeItem("tagCache");
}

export function getTag (tagId, tagCacheObject, setTagCache) {
    if (tagId in tagCacheObject) {
        return tagCacheObject[tagId];
    }

    fetch("/api/tags/" + tagId, {method: "GET"}).then(res => res.json()).then(
        (result) => {
            if ("tagId" in result) {
                tagCacheObject[result.tagId] = result;
                saveTagCache(tagCacheObject);

                if (setTagCache) {
                    let newTagObj = {tagId: result};
                    setTagCache(tagCacheObject => ({
                        ...tagCacheObject,
                        ...newTagObj
                    }));
                }
            }
        },
        (error) => {

        }
    );

    return null;
}