import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { Parcel, Building, VerticalUnit, formatUlpin3D } from '@sih/shared-types';

const CSV_PATH = `C:\\Users\\Wendell\\.gemini\\antigravity-ide\\brain\\f0199921-2adc-46fc-ab4e-06fc1a9447e0\\scratch\\mahaRERA-map-scrape\\2023-03-16_MahaRERA_mapdata.csv`;
const OUTPUT_PATH = path.join(__dirname, '../src/maharera.ts');

function run() {
  const fileContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
  });

  // Filter for Mumbai/Suburban and limit to 50
  const mumbaiProjects = records.filter((r: any) => 
    r.Project_District === 'Mumbai Suburban' || 
    r.Project_District === 'Mumbai City' || 
    r.Project_District === 'Mumbai'
  ).slice(0, 50);

  const parcels: Parcel[] = [];
  const buildings: Building[] = [];
  const units: VerticalUnit[] = [];

  mumbaiProjects.forEach((proj: any, idx: number) => {
    const lat = parseFloat(proj.lat);
    const lng = parseFloat(proj.lng);
    if (isNaN(lat) || isNaN(lng)) return;

    const baseUlpin = `MH13BOM${String(idx + 10000000).padStart(8, '0')}`;
    const parcelId = `parcel-maharera-${idx}`;
    const buildingId = `bldg-maharera-${idx}`;

    // Generate small 30x30m footprint around lat/lng
    const offset = 0.00015; // roughly 15m
    const footprintCoords = [
      [lng - offset, lat - offset],
      [lng + offset, lat - offset],
      [lng + offset, lat + offset],
      [lng - offset, lat + offset],
      [lng - offset, lat - offset]
    ];

    parcels.push({
      id: parcelId,
      ulpin: baseUlpin,
      state: proj.Project_State || 'Maharashtra',
      district: proj.Project_District,
      tehsil: proj.Project_Taluka || 'Mumbai',
      village: proj.locality || proj.Project_Village || 'Mumbai',
      surveyNumber: proj.PlotBearing || `CTS-${idx}`,
      areaSqm: 1200,
      centroid: [lng, lat],
      boundary: {
        type: 'Polygon',
        coordinates: [footprintCoords]
      },
      crs: 'EPSG:4326',
      ownershipType: 'Private',
      simulated: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const floors = 5 + (idx % 15); // 5 to 20 floors
    const bldgHeight = floors * 3.5;

    buildings.push({
      id: buildingId,
      parcelId: parcelId,
      name: proj.Name_of_Project || `MahaRERA Project ${idx}`,
      footprint: {
        type: 'Polygon',
        coordinates: [footprintCoords]
      },
      eavesHeightM: bldgHeight,
      roofHeightM: bldgHeight + 2,
      numFloors: floors,
      numBasements: 1,
      plinthElevationM: 1,
      yearBuilt: 2022,
      totalBuiltupAreaSqm: 1200 * floors,
      address: `${proj.street || ''}, ${proj.locality || ''}, ${proj.Project_District} - ${proj.PinCode || ''}`.replace(/^[,\s]+|[,\s]+$/g, ''),
      simulated: true
    });

    // Generate units for this building
    for (let f = 1; f <= floors; f++) {
      const zMin = 1 + (f - 1) * 3.5;
      const zMax = 1 + f * 3.5;
      
      // 2 units per floor
      for (let u = 1; u <= 2; u++) {
        const unitNum = `${f}0${u}`;
        const unitId = `unit-maharera-${idx}-${unitNum}`;
        units.push({
          id: unitId,
          buildingId: buildingId,
          parcelId: parcelId,
          ulpin3D: formatUlpin3D(baseUlpin, 'A', f, unitNum),
          domainCode: 'A',
          levelCode: `+${String(f).padStart(2, '0')}`,
          unitCode: unitNum,
          floorNumber: f,
          unitName: `Flat ${unitNum}`,
          useType: 'Residential',
          ownerName: `RERA Buyer ${unitNum}`,
          ownerId: `RERA-IND-${idx}-${unitNum}`,
          carpetAreaSqm: 85,
          builtupAreaSqm: 100,
          volumeCum: 100 * 3.5,
          zMin,
          zMax,
          verticalDatum: 'WGS84 MSL (Plinth +1m)',
          bounds: { minLng: lng - offset, maxLng: lng + offset, minLat: lat - offset, maxLat: lat + offset, minZ: zMin, maxZ: zMax },
          validationStatus: 'VALID',
          provenance: 'MAHARERA_PLAN',
          taxStatus: 'PAID',
          simulated: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }
  });

  const outputCode = `// GENERATED FILE - DO NOT EDIT MANUALLY
import { Parcel, Building, VerticalUnit } from '@sih/shared-types';

export const MAHARERA_PARCELS: Parcel[] = ${JSON.stringify(parcels, null, 2)};

export const MAHARERA_BUILDINGS: Building[] = ${JSON.stringify(buildings, null, 2)};

export const MAHARERA_UNITS: VerticalUnit[] = ${JSON.stringify(units, null, 2)};
`;

  fs.writeFileSync(OUTPUT_PATH, outputCode);
  console.log(`Successfully generated ${parcels.length} MahaRERA projects to src/maharera.ts`);
}

run();
