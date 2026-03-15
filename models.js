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
  racer: ['id', 'firstName', 'lastName', 'colour', 'country', 'image'],
  race: ['id', 'trackId', 'date', 'startingPositions', 'finishedPositions'],
  year: ['id', 'name', 'raceIds']
};

export const initialData = {
  tracks: [
    { id: 't1', name: 'USA', layout: 'base' },
    { id: 't2', name: 'FRANCE', layout: 'base' },
    { id: 't3', name: 'ITALY', layout: 'base' },
    { id: 't4', name: 'GREAT BRITAIN', layout: 'base' },
    { id: 't5', name: 'JAPAN', layout: 'rain' },
    { id: 't6', name: 'MEXICO', layout: 'rain' },
  ],
  racers: [
    { id: 'r1', firstName: 'Alexander', lastName: 'McKenzie', colour: 'green', country: 'gb', image: 'images/alice.png' },
    { id: 'r2', firstName: 'Lorenzo', lastName: 'Vitali', colour: 'red', country: 'it', image: 'images/lorenzo.png' },
    { id: 'r3', firstName: 'Pierre', lastName: 'Dubois', colour: 'blue', country: 'fr', image: 'images/pierre.png' },
    { id: 'r4', firstName: 'Willem', lastName: 'van der Velde', colour: 'orange', country: 'nl', image: 'images/willem.png' },
    { id: 'r5', firstName: 'Tommy', lastName: 'Rourke', colour: 'black ', country: 'us', image: 'images/tommy.png' },
    { id: 'r6', firstName: 'Taro', lastName: 'Nishimura', colour: 'grey', country: 'jp', image: 'images/taro.png' },
    { id: 'r7', firstName: 'João', lastName: 'Ribeiro', colour: 'yellow', country: 'br', image: 'images/joao.png' }
  ]
};