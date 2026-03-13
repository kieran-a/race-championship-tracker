import { loadCollection, saveCollection, generateId } from './storage.js';

function saveDefaultDrivers() {
    const defaults = [
        { id: generateId('racer-'), firstName: 'Alexander', lastName: 'McKenzie', country: '🇺🇸', image: 'images/alice.png' },
        { id: generateId('racer-'), firstName: 'Lorenzo', lastName: 'Vitali', country: '🇮🇹', image: 'images/lorenzo.png' },
        { id: generateId('racer-'), firstName: 'Charlie', lastName: 'Clark', country: '🇨🇦' },
        { id: generateId('racer-'), firstName: 'Dana', lastName: 'Davis', country: '🇦🇺' },
        { id: generateId('racer-'), firstName: 'Eve', lastName: 'Evans', country: '🇫🇷' }
    ];
    saveCollection('racers', defaults);
}

function createElement(tag, props = {}, ...children) {
    const el = document.createElement(tag);
    Object.entries(props).forEach(([k, v]) => el[k] = v);
    children.forEach(c => el.append(typeof c === 'string' ? document.createTextNode(c) : c));
    return el;
}

window.addEventListener('DOMContentLoaded', () => {
    // ensure there are some drivers for the demo; also patch any missing info such as images
    let drivers = loadCollection('racers');
    if (drivers.length === 0) {
        saveDefaultDrivers();
        drivers = loadCollection('racers');
    }
    // if the user already had drivers stored from an earlier version, augment them
    // with any missing defaults (particularly the image for Alice)
    const defaultList = [
        { firstName: 'Alexander', lastName: 'McKenzie', image: 'images/alice.png' },
        { firstName: 'Lorenzo', lastName: 'Vitali' },
        { firstName: 'Charlie', lastName: 'Clark' },
        { firstName: 'Dana', lastName: 'Davis' },
        { firstName: 'Eve', lastName: 'Evans' }
    ];
    let patched = false;
    drivers = drivers.map(d => {
        const def = defaultList.find(x => x.firstName === d.firstName && x.lastName === d.lastName);
        if (def && def.image && !d.image) {
            d.image = def.image;
            patched = true;
        }
        return d;
    });
    if (patched) {
        saveCollection('racers', drivers);
    }

    const list = document.getElementById('driver-list');
    if (!drivers.length) {
        document.getElementById('no-drivers').style.display = 'block';
        return;
    }
    drivers.forEach(d => {
        const fullName = [d.firstName, d.lastName].filter(Boolean).join(' ');
        const card = createElement('li', {});

        const link = createElement('a', { href: `driver-detail.html?id=${encodeURIComponent(d.id)}`, className: 'driver-card' });

        // driver.image should be a relative path to an image file (e.g. "images/drivers/alice.png").
        // fall back to the generic placeholder if no image is provided
        const imgSrc = d.image || 'images/placeholder.svg';
        const img = createElement('img', { src: imgSrc, alt: fullName });
        link.appendChild(img);
        const nameDiv = createElement('div', { className: 'name' }, fullName);
        link.appendChild(nameDiv);

        // flag can be added via emoji or image if d.country exists
        if (d.country) {
            const flag = createElement('span', { className: 'flag' }, d.country);
            link.appendChild(flag);
        }

        card.appendChild(link);
        list.appendChild(card);
    });
});