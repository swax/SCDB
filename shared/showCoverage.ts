// Top 15 shows targeted by the survey agent. `totalSeasons` is the
// expected season count; the suggest endpoint considers (showId, seasonNumber)
// pairs from 1..totalSeasons so it can suggest seasons that don't yet exist
// as rows in the season table.
export const SHOW_COVERAGE: { showId: number; totalSeasons: number }[] = [
{ showId: 1, totalSeasons: 51 }, // Saturday Night Live
{ showId: 4, totalSeasons: 5 },  // Key & Peele
{ showId: 2, totalSeasons: 15 }, // Mad TV
{ showId: 13, totalSeasons: 6 }, // The Kids in the Hall
{ showId: 3, totalSeasons: 3 },  // Chappelle's Show
{ showId: 16, totalSeasons: 4 }, // Mr. Show with Bob and David
{ showId: 5, totalSeasons: 5 },  // The Whitest Kids U'Know
{ showId: 15, totalSeasons: 5 }, // In Living Color
{ showId: 30, totalSeasons: 6 }, // SCTV
{ showId: 7, totalSeasons: 4 },  // The State
{ showId: 27, totalSeasons: 5 }, // Tim and Eric Awesome Show, Great Job!
{ showId: 19, totalSeasons: 4 }, // A Bit of Fry & Laurie
{ showId: 20, totalSeasons: 8 }, // Portlandia
{ showId: 6, totalSeasons: 4 },  // That Mitchell and Webb Look
{ showId: 10, totalSeasons: 3 }, // I Think You Should Leave
];
