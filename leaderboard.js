import { loadCollection } from './storage.js';

const pointsByPosition = [9, 6, 4, 3, 2, 1];

function pointsForPosition(pos) {
    return pointsByPosition[pos - 1] || 0;
}

function calculateLeaderboard() {
    const races = loadCollection('races');
    const racers = loadCollection('racers');
    
    if (races.length === 0) {
        return [];
    }
    
    const stats = {};
    
    racers.forEach(r => {
        stats[r.id] = {
            racerId: r.id,
            name: `${r.firstName} ${r.lastName}`,
            points: 0,
            wins: 0,
            podiums: 0,
            entries: 0
        };
    });
    
    races.forEach(race => {
        if (!race.finishedPositions) return;
        
        race.finishedPositions.forEach((posObj, idx) => {
            const position = idx + 1;
            const racerId = posObj.racerId;
            
            if (!stats[racerId]) return;
            
            stats[racerId].entries++;
            stats[racerId].points += pointsForPosition(position);
            
            if (position === 1) {
                stats[racerId].wins++;
            }
            
            if (position >= 1 && position <= 3) {
                stats[racerId].podiums++;
            }
        });
    });
    
    return Object.values(stats).sort((a, b) => b.points - a.points);
}

function renderLeaderboard() {
    const tbody = document.getElementById('leaderboard-body');
    const noRacesMsg = document.getElementById('no-races');
    const standings = calculateLeaderboard();
    
    if (standings.length === 0) {
        tbody.innerHTML = '';
        noRacesMsg.style.display = 'block';
        return;
    }
    
    noRacesMsg.style.display = 'none';
    tbody.innerHTML = '';
    
    standings.forEach((s, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${idx + 1}</td>
            <td>${s.name}</td>
            <td>${s.points}</td>
            <td>${s.wins}</td>
            <td>${s.podiums}</td>
            <td>${s.entries}</td>
        `;
        tbody.appendChild(tr);
    });
}

document.addEventListener('DOMContentLoaded', renderLeaderboard);
