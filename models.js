// Data schema definitions for Heat Legends Tracker

// Example structure for a track
// {
//   id: 'track-1',
//   name: 'Silverstone',
//   layout: 'Full Circuit'
// }

// Example structure for a racer/player
// {
//   id: 'racer-1',
//   firstName: 'Alice',
//   lastName: 'Smith',
//   notes: 'Prefers red cars'
// }

// Example structure for a race result entry
// {
//   id: 'race-2026-03-07-1',
//   trackId: 'track-1',
//   date: '2026-03-07',
//   startingPositions: [
//     { racerId: 'racer-1', car: 'Blue' },
//     { racerId: 'racer-2', car: 'Red' }
//   ],
//   finishedPositions: [
//     { racerId: 'racer-2', car: 'Red' },
//     { racerId: 'racer-1', car: 'Blue' }
//   ]
// }

// Example structure for a championship year
// {
//   id: 'year-2026',
//   name: '2026 Season',
//   raceIds: ['race-2026-03-07-1', ...]
// }

// A simple module export to reference these shapes
export const schemas = {
  track: ['id', 'name', 'layout'],
  racer: ['id', 'firstName', 'lastName', 'notes'],
  race: ['id', 'trackId', 'date', 'startingPositions', 'finishedPositions'],
  year: ['id', 'name', 'raceIds']
};
