import * as turf from '@turf/turf';

export const WESTERN_LINE_COORDS = [
  [72.8277, 18.9322], // Churchgate
  [72.8270, 18.9446], // Marine Lines
  [72.8184, 18.9519], // Charni Road
  [72.8159, 18.9619], // Grant Road
  [72.8184, 18.9696], // Mumbai Central
  [72.8252, 18.9827], // Mahalakshmi
  [72.8278, 18.9950], // Lower Parel
  [72.8300, 19.0150], // Prabhadevi
  [72.8427, 19.0195], // Dadar
  [72.8402, 19.0553], // Bandra
  [72.8459, 19.1197], // Andheri
  [72.8550, 19.2294]  // Borivali
];

export const WESTERN_LINE_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Western Line' },
      geometry: {
        type: 'LineString',
        coordinates: WESTERN_LINE_COORDS
      }
    }
  ]
};

const lineStr = turf.lineString(WESTERN_LINE_COORDS);
const lineLength = turf.length(lineStr, { units: 'kilometers' });

export interface TrainState {
  id: string;
  name: string;
  type: 'Fast Local' | 'Slow Local' | 'AC Local';
  direction: 'UP' | 'DOWN'; // UP: towards Churchgate, DOWN: towards Borivali
  source: string;
  destination: string;
  progress: number; // 0 to 1 (0 = start of line, 1 = end of line)
  speedKmH: number;
  totalLength: number;
}

// Generate some initial trains
export function generateInitialTrains(count: number): TrainState[] {
  const trains: TrainState[] = [];
  const types = ['Fast Local', 'Slow Local', 'AC Local'];
  
  for (let i = 0; i < count; i++) {
    const isDown = i % 2 === 0;
    trains.push({
      id: `train-wl-${i + 1000}`,
      name: `WL ${i + 1000}`,
      type: types[i % 3] as any,
      direction: isDown ? 'DOWN' : 'UP',
      source: isDown ? 'Churchgate' : 'Borivali',
      destination: isDown ? 'Borivali' : 'Churchgate',
      progress: Math.random(), // Random initial position along the line
      speedKmH: 45 + Math.random() * 20, // 45 to 65 km/h
      totalLength: lineLength
    });
  }
  return trains;
}

export function updateTrains(trains: TrainState[], deltaTimeMs: number): TrainState[] {
  return trains.map(t => {
    // Distance traveled in km in this time frame
    const distTraveled = (t.speedKmH * (deltaTimeMs / 3600000));
    // Percentage of total line length
    const progressDelta = distTraveled / lineLength;
    
    let newProgress = t.direction === 'DOWN' ? t.progress + progressDelta : t.progress - progressDelta;
    
    // Reverse direction at ends
    let newDir = t.direction;
    let newSource = t.source;
    let newDest = t.destination;
    
    if (newProgress > 1) {
      newProgress = 1 - (newProgress - 1);
      newDir = 'UP';
      newSource = 'Borivali';
      newDest = 'Churchgate';
    } else if (newProgress < 0) {
      newProgress = Math.abs(newProgress);
      newDir = 'DOWN';
      newSource = 'Churchgate';
      newDest = 'Borivali';
    }
    
    return {
      ...t,
      progress: newProgress,
      direction: newDir,
      source: newSource,
      destination: newDest
    };
  });
}

export function getTrainsGeoJSON(trains: TrainState[]): any {
  return {
    type: 'FeatureCollection',
    features: trains.map(t => {
      // Get point along line
      // Clamp distance to avoid Turf "coord is required" error if progress goes out of bounds
      const dist = Math.max(0, Math.min(t.progress * lineLength, lineLength));
      const point = turf.along(lineStr, dist, { units: 'kilometers' });
      
      return {
        type: 'Feature',
        properties: {
          id: t.id,
          name: t.name,
          type: t.type,
          direction: t.direction,
          source: t.source,
          destination: t.destination,
          speed: Math.round(t.speedKmH),
          progress: t.progress
        },
        geometry: point.geometry
      };
    })
  };
}
