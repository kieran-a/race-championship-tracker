// storage.js - simple wrapper around localStorage for JSON data

const PREFIX = 'heat-legends';

function key(collection) {
    return `${PREFIX}:${collection}`;
}

export function saveCollection(collection, items) {
    try {
        localStorage.setItem(key(collection), JSON.stringify(items));
    } catch (e) {
        console.error('Failed to save', collection, e);
    }
}

export function loadCollection(collection) {
    const raw = localStorage.getItem(key(collection));
    if (!raw) return [];
    try {
        return JSON.parse(raw);
    } catch (e) {
        console.error('Corrupted data for', collection, e);
        return [];
    }
}

export function addItem(collection, item) {
    const items = loadCollection(collection);
    items.push(item);
    saveCollection(collection, items);
    return item;
}

export function updateItem(collection, id, changes) {
    const items = loadCollection(collection);
    const idx = items.findIndex(i => i.id === id);
    if (idx === -1) return null;
    items[idx] = { ...items[idx], ...changes };
    saveCollection(collection, items);
    return items[idx];
}

export function deleteItem(collection, id) {
    let items = loadCollection(collection);
    items = items.filter(i => i.id !== id);
    saveCollection(collection, items);
}

export function generateId(prefix = '') {
    return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
}
