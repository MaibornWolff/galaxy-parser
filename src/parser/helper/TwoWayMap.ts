/**
 * A map where there is also a mapping back from the value to the key.
 * Does only work properly if values are also unique and defined.
 * Read-only.
 */
export class ConstantTwoWayMap<Key, Value> {
    private readonly map: Map<Key, Value>;
    private readonly reverseMap: Map<Value, Key>;

    constructor(map: Map<Key, Value>) {
        this.map = map;
        this.reverseMap = new Map();
        for (const key of map.keys()) {
            const value = map.get(key);
            if (value !== undefined && !this.reverseMap.has(value)) {
                this.reverseMap.set(value, key);
            } else {
                throw new Error(
                    "Tried to use ConstantTwoWayMap with non-unique or undefined values."
                );
            }
        }
    }

    getValue(key: Key) {
        return this.map.get(key);
    }
    getKey(value: Value) {
        return this.reverseMap.get(value);
    }

    /**
     * Gets all values for the keys of the specified iterable. Calls the specified function for all
     * mapped values, skipping elements for which there is no value available in the map.
     * @param iterator Iterable of elements to map.
     * @param insertFunction Function to call with the retrieved values.
     */
    getAllValuesFunctional(iterator: Iterable<Key>, insertFunction: (value: Value) => any) {
        for (const key of iterator) {
            const mapResult = this.getValue(key);
            if (mapResult !== undefined) {
                insertFunction(mapResult);
            }
        }
    }

    /**
     * Gets all keys for the values of the specified iterable. Calls the specified function for all
     * reverse-mapped keys, skipping elements for which there is no key available in the map.
     * @param iterator Iterable of values to reverse-map.
     * @param insertFunction Function to call with the retrieved keys.
     */
    getAllKeysFunctional(iterator: Iterable<Value>, insertFunction: (key: Key) => any) {
        for (const value of iterator) {
            const mapResult = this.getKey(value);
            if (mapResult !== undefined) {
                insertFunction(mapResult);
            }
        }
    }
}
