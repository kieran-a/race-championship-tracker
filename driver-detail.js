import { loadCollection } from './storage.js';

function $(selector) { return document.querySelector(selector); }

function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

function calculateDriverStats(driverId) {
    const races = loadCollection('races');
    const years = loadCollection('years');
    let starts = 0;
    let wins = 0;
    let podiums = 0;

    races.forEach(r => {
        const finished = r.finishedPositions;
        const posIndex = finished.findIndex(p => p.racerId === driverId);
        if (posIndex !== -1) {
            starts += 1;
            if (posIndex === 0) wins += 1;
            if (posIndex <= 2) podiums += 1;
        }
    });

    // championship wins: count years where driver is top of standings
    let champWins = 0;
    years.forEach(y => {
        // compute standings same as earlier util
        const points = {};
        y.raceIds.forEach(rid => {
            const race = races.find(rx => rx.id === rid);
            if (!race) return;
            race.finishedPositions.forEach((posObj, idx) => {
                const ridr = posObj.racerId;
                points[ridr] = (points[ridr] || 0) + ( [9,6,4,3,2,1][idx] || 0 );
            });
        });
        const sorted = Object.entries(points).sort((a,b)=>b[1]-a[1]);
        if (sorted.length && sorted[0][0] === driverId) {
            champWins += 1;
        }
    });

    return { starts, wins, podiums, champWins };
}

window.addEventListener('DOMContentLoaded', () => {
    const id = getQueryParam('id');
    if (!id) return;
    const drivers = loadCollection('racers');
    const d = drivers.find(x => x.id === id);
    if (!d) return;

    const fullName = [d.firstName, d.lastName].filter(Boolean).join(' ');
    $('#driver-name').textContent = fullName;
    $('#driver-country').textContent = d.country ? `Country: ${d.country}` : '';
    $('#driver-notes').textContent = d.notes || '';

    const stats = calculateDriverStats(id);
    $('#stat-championships').textContent = stats.champWins;
    $('#stat-starts').textContent = stats.starts;
    $('#stat-wins').textContent = stats.wins;
    $('#stat-podiums').textContent = stats.podiums;
});