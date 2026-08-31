import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface FeatureParams {
  mineId: string;
  state: string;
  district: string;
  featureType: string;
  centroid: [number, number]; // [lng, lat]
}

// In-memory mock database for existing ULDPNs
const existingFeatures: Record<string, any> = {};
const sequenceCounters: Record<string, number> = {};

/**
 * Phase 4: ULDPN Generation Algorithm
 * Deterministic generation with spatial deduplication (mocked 5-10m buffer check).
 */
export function generateULDPN(feature: FeatureParams): string {
  // Generate a hash of core attributes for exact match check
  const hashInput = `${feature.mineId}-${feature.featureType}-${feature.centroid[0].toFixed(4)}-${feature.centroid[1].toFixed(4)}`;
  const candidateKey = crypto.createHash('md5').update(hashInput).digest('hex');

  // Dedup check: In a real system, we would query the spatial DB (e.g., PostGIS ST_DWithin)
  // to find existing features of the same type within 5-10 meters.
  if (existingFeatures[candidateKey]) {
    return existingFeatures[candidateKey].uldpn;
  }

  // Generate new sequence
  const typeCodeMap: Record<string, string> = {
    'shaft': 'SHF',
    'entrance': 'ENT',
    'tunnel_segment': 'TUN',
    'gallery': 'GAL',
    'chamber': 'CHM',
    'junction': 'JNC',
    'ventilation_shaft': 'VSH'
  };

  const typeCode = typeCodeMap[feature.featureType] || 'UNK';
  const seqKey = `${feature.mineId}-${typeCode}`;
  
  if (!sequenceCounters[seqKey]) {
    sequenceCounters[seqKey] = 1;
  } else {
    sequenceCounters[seqKey]++;
  }

  const seq = sequenceCounters[seqKey].toString().padStart(4, '0');
  
  // Format: IND-{STATE}-{DISTRICT}-{MINE}-{FEATURETYPE}-{SEQ}
  // Extract state/district codes (simplified for demo)
  const stateCode = feature.state.substring(0, 2).toUpperCase();
  const districtCode = feature.district.substring(0, 3).toUpperCase();
  const mineCode = feature.mineId.split('-').pop()?.toUpperCase() || 'MINE';

  const uldpn = `IND-${stateCode}-${districtCode}-${mineCode}-${typeCode}-${seq}`;
  
  existingFeatures[candidateKey] = {
    uldpn,
    ...feature
  };

  return uldpn;
}

/**
 * Phase 6: Ingestion Pipeline CLI
 */
function ingestData(filePath: string) {
  console.log(`[Ingestion] Starting ingestion for file: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`[Error] File not found: ${filePath}`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  console.log(`[Ingestion] Loaded ${data.features?.length || 0} features.`);
  
  // Pipeline steps:
  // 1. Format validation
  // 2. CRS reprojection (assumed EPSG:4326 for GeoJSON)
  // 3. Geometry validation
  // 4. ULDPN Assignment
  
  const processed = data.features.map((f: any) => {
    // Example centroid extraction (simplified for Point)
    const centroid: [number, number] = f.geometry.type === 'Point' 
      ? [f.geometry.coordinates[0], f.geometry.coordinates[1]] 
      : [f.geometry.coordinates[0][0], f.geometry.coordinates[0][1]]; // Simplified for LineString start

    const uldpn = generateULDPN({
      mineId: f.properties.mineId || 'UNKNOWN_MINE',
      state: f.properties.state || 'XX',
      district: f.properties.district || 'XXX',
      featureType: f.properties.featureType || 'unknown',
      centroid
    });

    f.properties.uldpn = uldpn;
    f.properties.dataSource = 'proposed'; // Tagging data provenance
    return f;
  });

  console.log(`[Ingestion] Successfully assigned ULDPNs. Sample ID: ${processed[0]?.properties.uldpn}`);
  console.log(`[Ingestion] Data ready for DB insertion.`);
}

// Example usage if executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length > 0) {
    ingestData(args[0]);
  } else {
    console.log("Usage: ts-node ingest-mining-data.ts <path-to-geojson>");
  }
}
