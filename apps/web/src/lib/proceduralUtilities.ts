import * as turf from '@turf/turf';
import { UndergroundAsset } from '@sih/shared-types';

/**
 * Generates random underground utility networks (water, sewage, telecom, power)
 * procedurally based on a given center coordinate.
 * This simulates Pan-India dynamic utility data where live data is classified.
 */
export function generateProceduralUtilities(centerLng: number, centerLat: number): UndergroundAsset[] {
  const assets: UndergroundAsset[] = [];
  const radiusKm = 0.5; // Generate within 500m of the center
  
  const centerPoint = turf.point([centerLng, centerLat]);
  
  const types = [
    { type: 'WATER_SUPPLY', depthMin: 1.5, depthMax: 2.0, color: '#06b6d4', agency: 'Municipal Water Board' },
    { type: 'SEWER_DRAIN', depthMin: 2.5, depthMax: 3.5, color: '#f97316', agency: 'Municipal Sewerage Dept' },
    { type: 'POWER_HV', depthMin: 1.0, depthMax: 1.5, color: '#eab308', agency: 'State Electricity Board' },
    { type: 'TELECOM_FIBER', depthMin: 0.8, depthMax: 1.2, color: '#ec4899', agency: 'National Telecom' },
    { type: 'GAS_PIPELINE', depthMin: 2.0, depthMax: 3.0, color: '#14b8a6', agency: 'City Gas Distribution' }
  ];

  let assetCounter = 1;

  // Generate a random intersecting grid of lines to simulate city utility mains
  for (let i = 0; i < 40; i++) {
    const angle1 = (Math.random() * 360);
    const angle2 = (angle1 + 180 + (Math.random() * 20 - 10)) % 360;
    
    // Create a start and end point crossing through the center area
    const startPoint = turf.destination(centerPoint, radiusKm * (Math.random() + 0.5), angle1);
    const endPoint = turf.destination(centerPoint, radiusKm * (Math.random() + 0.5), angle2);
    
    // Add some random zig-zags to make it look like a street grid
    const midPoint1 = turf.destination(
      turf.midpoint(startPoint, endPoint), 
      radiusKm * 0.2, 
      angle1 + 45
    );
    const midPoint2 = turf.destination(
      turf.midpoint(startPoint, endPoint), 
      radiusKm * 0.2, 
      angle1 - 45
    );

    const rawLine = turf.lineString([
      startPoint.geometry.coordinates,
      midPoint1.geometry.coordinates,
      midPoint2.geometry.coordinates,
      endPoint.geometry.coordinates
    ]);
    
    const line = turf.bezierSpline(rawLine, { resolution: 10000 });

    // Pick a random utility type
    const utility = types[Math.floor(Math.random() * types.length)];
    
    const assetId = `proc-${utility.type.toLowerCase()}-${assetCounter++}`;
    
    // Convert 2D coordinates to 3D with depth
    const coords3D = line.geometry.coordinates.map(coord => [
      coord[0],
      coord[1],
      -((utility.depthMin + utility.depthMax) / 2)
    ]);

    assets.push({
      id: assetId,
      ulpin3D: `ULPIN-PROC-${assetId}`,
      assetType: utility.type as any,
      diameterMm: utility.type === 'SEWER_DRAIN' ? 1200 : (utility.type === 'WATER_SUPPLY' ? 800 : 300),
      depthMinM: utility.depthMin,
      depthMaxM: utility.depthMax,
      operationalStatus: 'ACTIVE',
      parcelId: 'parcel-proc-1',
      installationYear: 2020,
      validationStatus: 'UNVERIFIED',
      simulated: true,
      coordinates3D: {
        type: 'LineStringZ',
        coordinates: coords3D
      },
      owningAgency: utility.agency
    });
  }

  return assets;
}
