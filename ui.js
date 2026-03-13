import { loadCollection, addItem, updateItem, deleteItem, generateId, saveCollection } from './storage.js';

// helpers
function $(selector) { return document.querySelector(selector); }
function createElement(tag, props = {}, ...children) {
    const el = document.createElement(tag);
    Object.entries(props).forEach(([k,v]) => el[k] = v);
    children.forEach(c => el.append(typeof c === 'string' ? document.createTextNode(c) : c));
    return el;
}

// scoring rules for race positions
const pointsByPosition = [9, 6, 4, 3, 2, 1];
function pointsForPosition(pos) {
    return pointsByPosition[pos - 1] || 0;
}

// track management (read-only, hardcoded list)
function renderTracks() {
    const list = $('#track-list');
    list.innerHTML = '';
    const tracks = loadCollection('tracks');
    tracks.forEach(t => {
        const row = createElement('li', {},
            `${t.name} (${t.layout})`
        );
        list.appendChild(row);
    });
}

// ensure default tracks exist
function initDefaultTracks() {
    const existing = loadCollection('tracks');
    if (existing.length === 0) {
        const defaultTracks = [
            { id: generateId('track-'), name: 'USA', layout: 'base' },
            { id: generateId('track-'), name: 'France', layout: 'base' }
        ];
        saveCollection('tracks', defaultTracks);
    }
}

// racer management (with optional UI for additions)
function renderRacers() {
    const list = $('#racer-list');
    list.innerHTML = '';
    const racers = loadCollection('racers');
    racers.forEach(r => {
        const full = [r.firstName, r.lastName].filter(Boolean).join(' ');
        const row = createElement('li', {},
            full + ' ',
            createElement('button', {onclick: () => editRacer(r.id)}, 'Edit'),
            createElement('button', {onclick: () => removeRacer(r.id)}, 'Delete')
        );
        list.appendChild(row);
    });
}

function initDefaultRacers() {
    const existing = loadCollection('racers');
    if (existing.length === 0) {
        const defaultRacers = [
            { id: generateId('racer-'), firstName: 'Alice', lastName: 'Anderson', notes: '' },
            { id: generateId('racer-'), firstName: 'Bob', lastName: 'Brown', notes: '' },
            { id: generateId('racer-'), firstName: 'Charlie', lastName: 'Clark', notes: '' }
        ];
        saveCollection('racers', defaultRacers);
    }
}

function addRacerFromForm() {
    const first = $('#racer-first').value.trim();
    const last = $('#racer-last').value.trim();
    const notes = $('#racer-notes').value.trim();
    if (!first || !last) return;
    addItem('racers', { id: generateId('racer-'), firstName: first, lastName: last, notes });
    $('#racer-first').value = '';
    $('#racer-last').value = '';
    $('#racer-notes').value = '';
    renderRacers();
}

function editRacer(id) {
    const racers = loadCollection('racers');
    const r = racers.find(x => x.id === id);
    if (!r) return;
    $('#racer-first').value = r.firstName;
    $('#racer-last').value = r.lastName;
    $('#racer-notes').value = r.notes;
    $('#racer-add-btn').textContent = 'Save';
    $('#racer-add-btn').onclick = () => {
        updateItem('racers', id, { firstName: $('#racer-first').value, lastName: $('#racer-last').value, notes: $('#racer-notes').value });
        $('#racer-add-btn').textContent = 'Add';
        $('#racer-add-btn').onclick = addRacerFromForm;
        $('#racer-first').value='';
        $('#racer-last').value='';
        $('#racer-notes').value='';
        renderRacers();
    };
}

function removeRacer(id) {
    if (confirm('Delete this racer?')) {
        deleteItem('racers', id);
        renderRacers();
    }
}

// race management
function renderRaceForm() {
    const trackSelect = $('#race-track');
    trackSelect.innerHTML = '';
    loadCollection('tracks').forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;
        opt.textContent = t.name;
        trackSelect.appendChild(opt);
    });

    const container = $('#race-positions');
    container.innerHTML = '';
    const racers = loadCollection('racers');
    racers.forEach(r => {
        const row = createElement('div', {className: 'race-row'},
            createElement('span', {}, `${r.firstName} ${r.lastName}`),
            createElement('input', {type: 'number', min: 1, placeholder: 'Start', className: 'start-pos', 'data-id': r.id}),
            createElement('input', {type: 'number', min: 1, placeholder: 'Finish', className: 'finish-pos', 'data-id': r.id})
        );
        container.appendChild(row);
    });
}

// championship/year management
function renderYearForm() {
    const container = $('#year-races');
    container.innerHTML = '';
    loadCollection('races').forEach(r => {
        const chk = createElement('input', {type: 'checkbox', 'data-id': r.id});
        const order = createElement('input', {type: 'number', min: 1, placeholder: 'No.', className: 'year-order', 'data-id': r.id, style: 'width:3rem; margin-right:0.5rem;'});
        const label = createElement('label', {}, chk, ` ${r.date} (${loadCollection('tracks').find(t=>t.id===r.trackId)?.name||''})`);
        const div = createElement('div', {className: 'year-row'}, order, label);
        container.appendChild(div);
    });
}

function gatherSelectedRaces() {
    const entries = [];
    document.querySelectorAll('#year-races .year-row').forEach(row => {
        const chk = row.querySelector('input[type=checkbox]');
        const orderInp = row.querySelector('.year-order');
        if (chk.checked) {
            const id = chk.dataset.id;
            const ord = parseInt(orderInp.value, 10) || Infinity;
            entries.push({ id, ord });
        }
    });
    entries.sort((a,b)=>a.ord - b.ord);
    return entries.map(e=>e.id);
}

function addYearFromForm() {
    const name = $('#year-name').value.trim();
    if (!name) return;
    const raceIds = gatherSelectedRaces();
    const year = { id: generateId('year-'), name, raceIds };
    addItem('years', year);
    renderYears();
    renderYearForm();
    $('#year-name').value = '';
}

function calculateStandings(year) {
    const points = {};
    year.raceIds.forEach(rid => {
        const race = loadCollection('races').find(r=>r.id===rid);
        if (!race) return;
        race.finishedPositions.forEach((posObj, idx) => {
            const racerId = posObj.racerId;
            points[racerId] = (points[racerId] || 0) + pointsForPosition(idx+1);
        });
    });
    // convert to sorted array
    return Object.entries(points)
        .map(([racerId, pts]) => ({ racerId, pts }))
        .sort((a,b)=>b.pts - a.pts);
}

function renderYears() {
    const list = $('#year-list');
    list.innerHTML = '';
    loadCollection('years').forEach(y => {
        const standings = calculateStandings(y);
        const standStr = standings.map(s => {
            const r = loadCollection('racers').find(rr=>rr.id===s.racerId);
            return `${r?.firstName} ${r?.lastName}: ${s.pts}`;
        }).join('; ');
        const schedule = y.raceIds.map((rid,i)=>{
            const race = loadCollection('races').find(r=>r.id===rid);
            const track = loadCollection('tracks').find(t=>t.id===race?.trackId);
            return `${String(i+1).padStart(2,'0')} - ${track?.name||'?'}`;
        }).join(', ');
        const item = createElement('li', {},
            `${y.name}: ${schedule} — ${standStr}`
        );
        list.appendChild(item);
    });
}

function gatherPositions() {
    const starts = [];
    const finishes = [];
    document.querySelectorAll('#race-positions .start-pos').forEach(inp => {
        const val = parseInt(inp.value, 10);
        if (val) starts.push({ racerId: inp.dataset.id, pos: val });
    });
    document.querySelectorAll('#race-positions .finish-pos').forEach(inp => {
        const val = parseInt(inp.value, 10);
        if (val) finishes.push({ racerId: inp.dataset.id, pos: val });
    });
    starts.sort((a,b)=>a.pos-b.pos);
    finishes.sort((a,b)=>a.pos-b.pos);
    return {
        startingPositions: starts.map(o => ({ racerId: o.racerId })),
        finishedPositions: finishes.map(o => ({ racerId: o.racerId }))
    };
}

let editingRaceId = null;

function addRaceFromForm() {
    const trackId = $('#race-track').value;
    const date = new Date().toISOString().substring(0,10);
    const { startingPositions, finishedPositions } = gatherPositions();
    if (editingRaceId) {
        updateItem('races', editingRaceId, { trackId, date, startingPositions, finishedPositions });
        editingRaceId = null;
        $('#race-add-btn').textContent = 'Record race';
    } else {
        const race = { id: generateId('race-'), trackId, date, startingPositions, finishedPositions };
        addItem('races', race);
    }
    renderRaces();
    renderRaceForm();
}

function formatPositionArray(arr) {
    return arr.map((p,i) => `${i+1}. ${loadCollection('racers').find(r=>r.id===p.racerId)?.firstName || '?'} ${loadCollection('racers').find(r=>r.id===p.racerId)?.lastName || ''}`).join(', ');
}

function renderRaces() {
    const list = $('#race-list');
    list.innerHTML = '';
    const races = loadCollection('races');
    races.forEach(r => {
        const track = loadCollection('tracks').find(t=>t.id===r.trackId);
        const startStr = r.startingPositions.length ? formatPositionArray(r.startingPositions) : '(planned)';
        const finishStr = r.finishedPositions.length ? formatPositionArray(r.finishedPositions) : '(planned)';
        const item = createElement('li', {},
            `${r.date} - ${track?.name || 'Unknown'}\n`,
            `Start: ${startStr}\n`,
            `Finish: ${finishStr} `,
            createElement('button', {onclick: () => editRace(r.id)}, 'Edit'),
            createElement('button', {onclick: () => deleteRace(r.id)}, 'Delete')
        );
        list.appendChild(item);
    });
}

// editing helpers
function editRace(id) {
    const race = loadCollection('races').find(r=>r.id===id);
    if (!race) return;
    editingRaceId = id;
    $('#race-track').value = race.trackId;
    // populate positions inputs
    renderRaceForm();
    race.startingPositions.forEach((p,i) => {
        document.querySelectorAll('#race-positions .start-pos')[i].value = i+1;
    });
    race.finishedPositions.forEach((p,i) => {
        document.querySelectorAll('#race-positions .finish-pos')[i].value = i+1;
    });
    $('#race-add-btn').textContent = 'Save';
}

function deleteRace(id) {
    if (confirm('Delete this race?')) {
        deleteItem('races', id);
        renderRaces();
        renderYearForm();
        renderRaceForm();
    }
}

function exportData() {
    const collections = ['tracks','racers','races','years'];
    const dump = {};
    collections.forEach(c => dump[c] = loadCollection(c));
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'heat-legends-data.json';
    a.click();
    URL.revokeObjectURL(url);
}

function handleImportFile(evt) {
    const file = evt.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const data = JSON.parse(reader.result);
            ['tracks','racers','races','years'].forEach(c => {
                if (data[c]) saveCollection(c, data[c]);
            });
            // refresh UI
            renderTracks();
            renderRacers();
            renderRaces();
            renderYearForm();
            renderYears();
            alert('Data imported successfully');
        } catch (e) {
            alert('Failed to parse JSON');
        }
    };
    reader.readAsText(file);
}

// initialization
export function initUI() {
    // no track add UI, but ensure base list loads
    initDefaultTracks();
    renderTracks();

    // racers start with a small predefined set but can be extended via UI
    initDefaultRacers();
    $('#racer-add-btn').onclick = addRacerFromForm;
    renderRacers();

    // races
    renderRaceForm();
    $('#race-add-btn').onclick = addRaceFromForm;
    renderRaces();

    // championships/years
    renderYearForm();
    $('#year-add-btn').onclick = addYearFromForm;
    renderYears();

    // data export/import
    $('#export-btn').onclick = exportData;
    $('#import-file').onchange = handleImportFile;
}
