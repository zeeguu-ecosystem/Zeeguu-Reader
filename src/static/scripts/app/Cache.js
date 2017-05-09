/**
 * Interface to the {@link Storage} features that allows for storing and retrieving of objects by marshalling them.
 */
export default class Cache {
    /**
     * Check if sessionStorage is available for use.
     * @returns {boolean} availability - Whether or not caching features are available for use.
     */
    static isAvailable() {
        return typeof(Storage) !== "undefined";
    }

    /**
     * Store an object in cache, will not do anything of Cache is not available.
     * @param {string} key - The key for which the object can be retrieved.
     * @param {Object} object - The object to store.
     */
    static store(key, object) {
        if (this.isAvailable())
            window.sessionStorage.setItem(key, JSON.stringify(object));
    }

    /**
     * Check if an object is stored under key.
     * @param {string} key - The key for which the object can be retrieved.
     * @returns {boolean} isStored - Whether or not the object is stored.
     */
    static has(key) {
        return this.retrieve(key) !== null;
    }

    /**
     * Return the object stored.
     * @param {string} key - The key for which the object can be retrieved.
     * @returns {?Object} object - The stored object, null if storage not available or not stored under key.
     */
    static retrieve(key) {
        let object = null;
        if (this.isAvailable()) {
            object = sessionStorage.getItem(key);
            if (object !== null)
                object = JSON.parse(object);
        }
        return object;
    }
}