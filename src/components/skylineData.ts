/**
 * City Skyline Data for GridSkylineBackground
 * Each city is an array of buildings with:
 * - x: position as % of viewport width (0-100)
 * - width: building width as % of viewport width
 * - height: building height as % of viewport height (from bottom)
 * - antennaHeight: optional antenna height as % of viewport height
 */

export interface Building {
  x: number
  width: number
  height: number
  antennaHeight?: number
}

export interface CitySkyline {
  name: string
  buildings: Building[]
}

// Helper to ensure all cities have the same number of buildings
const BUILDING_COUNT = 24

function padBuildings(buildings: Building[]): Building[] {
  const padded = [...buildings]
  while (padded.length < BUILDING_COUNT) {
    // Add invisible buildings spread across the viewport
    padded.push({
      x: (padded.length * 100) / BUILDING_COUNT,
      width: 0,
      height: 0,
    })
  }
  return padded.slice(0, BUILDING_COUNT)
}

// New York City - Tall cluster center-left (Freedom Tower), secondary right-of-center (Midtown)
const nycBuildings: Building[] = [
  // Far left - Lower buildings
  { x: 2, width: 3, height: 12 },
  { x: 6, width: 2.5, height: 18 },
  { x: 10, width: 3.5, height: 15 },

  // Financial District cluster
  { x: 15, width: 3, height: 28 },
  { x: 19, width: 4, height: 35 },
  { x: 24, width: 3.5, height: 42, antennaHeight: 4 }, // Freedom Tower
  { x: 28, width: 3, height: 32 },
  { x: 32, width: 2.5, height: 25 },

  // Mid-gap
  { x: 37, width: 3, height: 18 },
  { x: 41, width: 2, height: 14 },

  // Midtown cluster
  { x: 48, width: 3.5, height: 38 },
  { x: 52, width: 4, height: 45, antennaHeight: 3 }, // Empire State
  { x: 57, width: 3, height: 40 },
  { x: 61, width: 2.5, height: 33 },
  { x: 65, width: 3.5, height: 36, antennaHeight: 2 },
  { x: 69, width: 2.5, height: 28 },

  // Upper East / taper
  { x: 74, width: 3, height: 22 },
  { x: 78, width: 2.5, height: 18 },
  { x: 82, width: 3, height: 15 },
  { x: 86, width: 2, height: 12 },
  { x: 90, width: 2.5, height: 10 },
  { x: 94, width: 2, height: 8 },
]

// Chicago - Two dominant towers (Willis/Hancock) with supporting mid-rises, more spread out
const chicagoBuildings: Building[] = [
  // Left section
  { x: 3, width: 3, height: 14 },
  { x: 8, width: 2.5, height: 20 },
  { x: 12, width: 3.5, height: 24 },

  // Willis Tower area
  { x: 18, width: 5, height: 48, antennaHeight: 5 }, // Willis Tower
  { x: 24, width: 3, height: 28 },
  { x: 28, width: 2.5, height: 22 },

  // Mid section
  { x: 34, width: 3, height: 18 },
  { x: 38, width: 2.5, height: 16 },
  { x: 43, width: 3, height: 20 },
  { x: 48, width: 2, height: 14 },

  // Hancock area
  { x: 55, width: 3, height: 26 },
  { x: 60, width: 4.5, height: 44, antennaHeight: 4 }, // Hancock
  { x: 66, width: 3, height: 30 },
  { x: 70, width: 2.5, height: 24 },

  // Right taper
  { x: 76, width: 3, height: 18 },
  { x: 80, width: 2.5, height: 15 },
  { x: 85, width: 2, height: 12 },
  { x: 90, width: 2.5, height: 10 },
  { x: 95, width: 2, height: 8 },
]

// Miami - More uniform height, no dominant tower, coastal/flat feel
const miamiBuildings: Building[] = [
  { x: 3, width: 3, height: 16 },
  { x: 8, width: 3.5, height: 20 },
  { x: 13, width: 3, height: 24 },
  { x: 18, width: 3.5, height: 22 },
  { x: 23, width: 3, height: 26 },
  { x: 28, width: 4, height: 28 },
  { x: 33, width: 3.5, height: 25 },
  { x: 38, width: 3, height: 23 },
  { x: 43, width: 4, height: 27 },
  { x: 48, width: 3.5, height: 24 },
  { x: 53, width: 3, height: 22 },
  { x: 58, width: 4, height: 26 },
  { x: 63, width: 3.5, height: 28 },
  { x: 68, width: 3, height: 24 },
  { x: 73, width: 3.5, height: 22 },
  { x: 78, width: 3, height: 20 },
  { x: 83, width: 3.5, height: 18 },
  { x: 88, width: 3, height: 15 },
  { x: 93, width: 2.5, height: 12 },
]

// London - The Shard as standout, Gherkin cluster, generally lower profile
const londonBuildings: Building[] = [
  // Left - residential/older
  { x: 3, width: 2.5, height: 10 },
  { x: 7, width: 3, height: 12 },
  { x: 11, width: 2.5, height: 14 },

  // The Shard area
  { x: 17, width: 2, height: 52, antennaHeight: 3 }, // The Shard (narrow and tall)
  { x: 21, width: 3, height: 18 },
  { x: 25, width: 2.5, height: 14 },

  // Mid gap
  { x: 31, width: 3, height: 12 },
  { x: 36, width: 2.5, height: 10 },
  { x: 40, width: 2, height: 8 },

  // City of London / Gherkin cluster
  { x: 48, width: 3, height: 22 },
  { x: 52, width: 3.5, height: 30 }, // Gherkin area
  { x: 57, width: 3, height: 26 },
  { x: 61, width: 4, height: 32 }, // 22 Bishopsgate
  { x: 66, width: 3, height: 24 },
  { x: 70, width: 2.5, height: 20 },

  // Canary Wharf
  { x: 78, width: 3.5, height: 28 },
  { x: 82, width: 3, height: 26 },
  { x: 86, width: 3.5, height: 24 },
  { x: 91, width: 2.5, height: 16 },
  { x: 95, width: 2, height: 12 },
]

// Dubai - Burj Khalifa as extreme spike, otherwise spread with several tall towers
const dubaiBuildings: Building[] = [
  // Left section
  { x: 3, width: 3, height: 18 },
  { x: 8, width: 3.5, height: 24 },
  { x: 13, width: 3, height: 28 },
  { x: 18, width: 4, height: 32 },

  // Burj Khalifa area
  { x: 25, width: 3, height: 26 },
  { x: 30, width: 1.5, height: 65, antennaHeight: 6 }, // Burj Khalifa - very tall, narrow
  { x: 34, width: 3, height: 30 },
  { x: 38, width: 3.5, height: 34 },

  // Mid section
  { x: 44, width: 4, height: 36 },
  { x: 49, width: 3.5, height: 32 },
  { x: 54, width: 3, height: 28 },

  // Marina cluster
  { x: 62, width: 3.5, height: 38 },
  { x: 67, width: 4, height: 42 },
  { x: 72, width: 3.5, height: 35 },
  { x: 77, width: 3, height: 30 },

  // Right taper
  { x: 83, width: 3.5, height: 25 },
  { x: 88, width: 3, height: 20 },
  { x: 93, width: 2.5, height: 15 },
]

export const citySkylines: CitySkyline[] = [
  { name: 'NEW YORK', buildings: padBuildings(nycBuildings) },
  { name: 'CHICAGO', buildings: padBuildings(chicagoBuildings) },
  { name: 'MIAMI', buildings: padBuildings(miamiBuildings) },
  { name: 'LONDON', buildings: padBuildings(londonBuildings) },
  { name: 'DUBAI', buildings: padBuildings(dubaiBuildings) },
]
