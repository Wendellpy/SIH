/**
 * Standard 3D ULPIN Types and Geospatial Cadastral Models
 * Smart India Hackathon #26011 - Ministry of Rural Development (DoLR)
 */

export type DomainCode = 'G' | 'A' | 'U' | 'T' | 'S';

export interface ParsedUlpin3D {
  baseUlpin: string;      // 14-char base ULPIN (e.g. MH13BOM04521873)
  domainCode: DomainCode; // G=Ground, A=Above-ground, U=Underground, T=Transport
  levelCode: string;      // 00, +01..+99, -01..-99
  levelNumber: number;    // Normalized integer floor/depth level (e.g. 3, -1, 0)
  unitCode: string;       // B302, WSUP12, etc.
  rawString: string;      // Full 3D ULPIN string
}

export type UseClassification = 
  | 'Residential' 
  | 'Commercial' 
  | 'Institutional' 
  | 'Recreational' 
  | 'Industrial' 
  | 'Utility'
  | 'Transport';

export type ValidationStatus = 
  | 'VALID' 
  | 'CONFLICT' 
  | 'PENDING_REVIEW' 
  | 'UNVERIFIED';

export type ProvenanceSource = 
  | 'DRONE_LIDAR' 
  | 'MAHARERA_PLAN' 
  | 'BMC_GIS' 
  | 'GNSS_CORS' 
  | 'SYNTHETIC_DEMO';

export type UndergroundAssetType = 
  | 'WATER_SUPPLY' 
  | 'SEWER_DRAIN' 
  | 'POWER_HV' 
  | 'TELECOM_FIBER' 
  | 'GAS_PIPELINE' 
  | 'METRO_TUNNEL';

export interface GeoPoint3D {
  longitude: number;
  latitude: number;
  altitude: number; // elevation in meters relative to MSL/WGS84 ellipsoid
}

export interface GeoPolygon2D {
  type: 'Polygon';
  coordinates: number[][][]; // [ [ [lng, lat], ... ] ]
}

export interface GeoPolygon3D {
  type: 'PolygonZ';
  coordinates: number[][][]; // [ [ [lng, lat, alt], ... ] ]
}

export interface GeoLineString3D {
  type: 'LineStringZ';
  coordinates: number[][]; // [ [lng, lat, alt], ... ]
}

export interface BoundingBox3D {
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
  minZ: number; // meters
  maxZ: number; // meters
}

export interface Parcel {
  id: string;
  ulpin: string; // 14-char base ULPIN (e.g. MH13BOM04521873)
  state: string; // Maharashtra
  district: string; // Mumbai Suburban
  tehsil: string; // Andheri / Kurla / Mumbai City
  village: string; // BKC / Bandra / Nariman Point
  surveyNumber: string;
  areaSqm: number;
  centroid: [number, number]; // [lng, lat]
  boundary: GeoPolygon2D;
  crs: string; // EPSG:4326 / EPSG:32643
  ownershipType: 'Government' | 'Private' | 'Municipal' | 'Leasehold';
  zoningCategory?: string;
  visibleTo?: string[];
  simulated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Building {
  id: string;
  parcelId: string;
  ulpin3D?: string;
  name: string;
  footprint: GeoPolygon2D;
  eavesHeightM: number;
  roofHeightM: number;
  numFloors: number;
  numBasements: number;
  plinthElevationM: number;
  yearBuilt?: number;
  totalBuiltupAreaSqm: number;
  address: string;
  simulated: boolean;
  reraId?: string;
  reraProjectName?: string;
  reraPromoter?: string;
  reraStatus?: string;
}

export type VerticalUnitGeoreference = {
  crs: string;                          // e.g. "EPSG:4979" (geodetic 3D)
  ellipsoidHeightM?: number;            // raw GNSS output
  groundElevationM?: number;            // from DEM at the parcel footprint
  floorElevationAboveGroundM?: number;  // derived: unit elevation − groundElevationM
  surveySource?: {
    gnssStationOrCorsId?: string;
    surveyDate?: string;
    horizontalAccuracyM?: number;
    verticalAccuracyM?: number;
  };
  demSource?: string;                   // which DEM produced groundElevationM
  dsmComparisonM?: number;              // optional: DSM-derived surface height at same footprint
  dataSource: 'verified' | 'demo' | 'proposed';
} & (
  | { verticalDatum: 'ellipsoidal'; orthometricHeightM?: never; geoidModel?: never }
  | { verticalDatum: 'orthometric'; orthometricHeightM: number; geoidModel: string }
);

export interface VerticalUnit {
  id: string;
  buildingId: string;
  parcelId: string;
  ulpin3D: string; // e.g. MH13BOM04521873.A+03-B302
  domainCode: DomainCode;
  levelCode: string;
  unitCode: string;
  floorNumber: number;
  unitName: string;
  useType: UseClassification;
  ownerName: string;
  ownerId: string; // Aadhaar hash / PAN / Corporate ID
  carpetAreaSqm: number;
  builtupAreaSqm: number;
  volumeCum: number;
  zMin: number; // Lower vertical boundary in meters
  zMax: number; // Upper vertical boundary in meters
  verticalDatum: string; // e.g. WGS84 MSL / Plinth Datum
  bounds: BoundingBox3D;
  meshGeometry?: any; // Three.js / Cesium Solid structure
  validationStatus: ValidationStatus;
  provenance: ProvenanceSource;
  taxStatus: 'PAID' | 'DUE' | 'DISPUTED' | 'EXEMPT';
  simulated: boolean;
  createdAt: string;
  updatedAt: string;
  visibleTo?: string[];
  georeference?: VerticalUnitGeoreference;
}

export interface UndergroundAsset {
  id: string;
  ulpin3D: string; // e.g. MH13BOM04521873.U-01-WSUP12
  parcelId: string;
  assetType: UndergroundAssetType;
  diameterMm: number;
  depthMinM: number;
  depthMaxM: number;
  coordinates3D: GeoLineString3D;
  owningAgency: string; // BMC Water Dept, Adani Electricity, MGL Gas, MMRCL Metro
  installationYear: number;
  operationalStatus: 'ACTIVE' | 'MAINTENANCE' | 'DECOMMISSIONED';
  validationStatus: ValidationStatus;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  simulated: boolean;
  visibleTo?: string[];
}

export interface GNSSMetaData {
  surveyId: string;
  horizontalAccuracyM: number;
  verticalAccuracyM: number;
  fixType: 'RTK_FIXED' | 'RTK_FLOAT' | 'DGPS' | 'SPS';
  corsReferenceStation: string;
  correctionMethod: string;
  operator: string;
  dataSource: string;
  observationTimestamp: string;
  satellitesUsed: number;
  crs: string; // e.g. WGS84
  isProposed?: boolean; // Label for features not yet built live
}

// ---------------------------------------------------------
// PUBLIC AMENITIES
// ---------------------------------------------------------
export type PublicFeatureCategory = 'parking' | 'park' | 'school' | 'hospital' | 'other';

export interface PublicFeature {
  id: string;
  category: PublicFeatureCategory;
  name?: string;
  geometry: any; // GeoJSON Point or Polygon
  operator?: string;
  capacity?: number;
  dataSource: 'verified' | 'demo' | 'proposed';
  sourceName?: string;
}

// ---------------------------------------------------------
// ELEVATED CORRIDORS (e.g. Metro)
// ---------------------------------------------------------
export interface ElevatedCorridor {
  id: string;
  corridorType: 'metro' | 'monorail' | 'flyover' | 'skywalk';
  lineName?: string;
  geometry: any; // GeoJSON LineString
  verticalPosition: 'elevated';
  heightAboveGroundM?: number;
  operator?: string;
  status: 'operational' | 'under_construction' | 'planned';
  stations?: MetroStation[];
  dataSource: 'verified' | 'demo' | 'proposed';
  sourceName?: string;
}

export interface MetroStation {
  id: string;
  name: string;
  geometry: any; // GeoJSON Point
  corridorId: string;
  interchangeWith?: string[];
}

// ---------------------------------------------------------
// REGULATED BOUNDARIES
// ---------------------------------------------------------
export type RegulatedBoundaryType = 'eco_sensitive_zone' | 'national_park' | 'wildlife_sanctuary' | 'crz' | 'other_protected';

export interface RegulatedBoundary {
  id: string;
  boundaryType: RegulatedBoundaryType;
  name?: string;
  geometry: any; // GeoJSON Polygon | MultiPolygon
  crzCategory?: 'CRZ-I' | 'CRZ-II' | 'CRZ-III' | 'CRZ-IV';
  notifyingAuthority?: string;
  notificationDate?: string;
  notificationReference?: string;
  restrictions?: string;
  dataSource: 'verified' | 'demo' | 'proposed';
  sourceName?: string;
}

export interface TerrainMetrics {
  minElevationM: number;
  maxElevationM: number;
  meanElevationM: number;
  minSlopeDeg: number;
  maxSlopeDeg: number;
  meanSlopeDeg: number;
  slopeClassification: 'Flat' | 'Gentle' | 'Moderate' | 'Steep' | 'Very Steep';
  predominantAspect: string; // e.g. North, North-East
  dataSource: string; // e.g. Synthetic DEM
  isSynthetic?: boolean;
}

export interface EnvironmentalProximity {
  nearestWaterBodyDistM: number;
  nearestSettlementDistM: number;
  nearestRoadDistM: number;
  nearestForestDistM: number;
  ecoSensitiveZoneIntersection: boolean;
  protectedAreaIntersection: boolean;
  isSynthetic?: boolean;
}

export interface UndergroundFeatureBase {
  uldpn: string;
  mineId: string;
  state: string;
  district: string;
  miningRegion?: string;
  featureType: 'shaft' | 'entrance' | 'tunnel_segment' | 'gallery' | 'chamber' | 'junction' | 'ventilation_shaft';
  mineral?: string;
  miningMethod?: string;
  level?: number;
  status?: 'active' | 'inactive' | 'abandoned' | 'unknown';
  surveyDate?: string;
  dataSource: 'verified' | 'demo' | 'proposed';
  sourceName?: string;
  positionalAccuracyM?: number;
  verticalAccuracyM?: number;
  crs: string;
}

export interface TunnelSegment extends UndergroundFeatureBase {
  featureType: 'tunnel_segment';
  geometry: GeoLineString3D | { type: 'LineString'; coordinates: number[][] };
  startCoordinate: [number, number, number?];
  endCoordinate: [number, number, number?];
  lengthM: number;
  surfaceElevationM?: number;
  undergroundElevationM?: number;
  depthBelowSurfaceM?: number;
  azimuthDeg?: number;
  tunnelType?: string;
  connectsTo: string[]; // ULDPNs
  deformationCorrelation?: TunnelDeformationCorrelation;
}

export interface UndergroundNode extends UndergroundFeatureBase {
  featureType: 'shaft' | 'entrance' | 'chamber' | 'junction' | 'ventilation_shaft';
  geometry: { type: 'Point'; coordinates: [number, number, number?] };
  connectedSegments: string[]; // ULDPNs
}

export interface UndergroundNetwork {
  nodes: UndergroundNode[];
  segments: TunnelSegment[];
}

export interface DeformationObservation {
  id: string;
  acquisitionDate: string;
  sensor: 'Sentinel-1A' | 'Sentinel-1B' | 'Sentinel-1C';
  productType: 'SLC';
  processingMethod: 'DInSAR' | 'PS-InSAR' | 'SBAS';
  geometry: 'ascending' | 'descending';
  losDisplacementMm: number;
  coherence: number;
  crs: string;
  demSource: string;
  processingChain: string[];
  dataSource: 'verified' | 'demo' | 'proposed';
}

export interface DeformationTimeSeries {
  locationId: string;
  geometry: { type: 'Point' | 'Polygon'; coordinates: any };
  observations: { date: string; cumulativeDisplacementMm: number; coherence: number }[];
  velocityMmPerYear?: number;
  trend: 'stable' | 'gradual' | 'accelerating' | 'sudden' | 'insufficient_data';
}

export interface TunnelDeformationCorrelation {
  uldpn: string;
  analysisZoneRadiusM: number;
  meanLosDeformationMm?: number;
  maxLosDeformationMm?: number;
  minLosDeformationMm?: number;
  velocityMmPerYear?: number;
  cumulativeDisplacementMm?: number;
  affectedPixelPercent?: number;
  distanceToHotspotM?: number;
  meanCoherence?: number;
  analyticalStatus: 'stable' | 'monitor' | 'deformation_detected' | 'high_deformation_investigation_recommended' | 'insufficient_data';
  lastObservationDate?: string;
  
  // Expose the raw data sources this was derived from
  dataSources?: {
    sensor: string;
    processingMethod: string;
    demSource: string;
    coherenceThreshold: number;
  };
}

export interface MiningArea {
  id: string;
  name: string;
  coordinates: [number, number]; // [lng, lat]
  boundary: GeoPolygon2D;
  district: string;
  state: string;
  tehsil: string;
  mineral: string;
  miningType: 'OPEN_CAST' | 'UNDERGROUND' | 'PLACER';
  operationalStatus: 'ACTIVE' | 'INACTIVE' | 'ABANDONED';
  areaSqm: number;
  
  // Intelligence Metrics
  gnssMetaData?: GNSSMetaData;
  terrainMetrics?: TerrainMetrics;
  environmentalProximity?: EnvironmentalProximity;
  
  incidentCount: number; // Will be 0 or marked as future scope
  analyticalRiskIndicator: number | null; // e.g., 0-100 system generated score
  
  dataSource: string;
  lastUpdated: string;
  isSynthetic?: boolean;
  
  // Revised V2 Hierarchy
  undergroundNetwork?: UndergroundNetwork;
  
  // Revised V3 InSAR Module
  insarTimeSeries?: DeformationTimeSeries;
}

export type JobType = 
  | 'FOOTPRINT_EXTRACTION' 
  | 'FLOORPLAN_VECTORIZATION' 
  | 'LIDAR_NDSM_HEIGHT' 
  | 'TOPOLOGY_COLLISION_CHECK';

export type JobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface AIJob {
  id: string;
  type: JobType;
  status: JobStatus;
  progress: number; // 0 to 100
  currentStage: string;
  inputFilename: string;
  fileSizeBytes: number;
  mimeType: string;
  results?: any;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export type ConflictRuleCode = 
  | 'ERR_3D_Z_OVERLAP' 
  | 'ERR_BOUND_PROTRUSION' 
  | 'ERR_NON_WATERTIGHT' 
  | 'ERR_UNMAPPED_VOLUME'
  | 'ERR_UTILITY_DEPTH_INTERFERENCE';

export interface TopologyValidationLog {
  id: string;
  ruleCode: ConflictRuleCode;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  ulpin3DPrimary: string;
  ulpin3DColliding?: string;
  buildingId: string;
  message: string;
  details: {
    overlapVolumeCum?: number;
    elevationZRange?: [number, number];
    overlapPercentage?: number;
    description: string;
  };
  centroid: [number, number, number]; // [lng, lat, z]
  status: 'OPEN' | 'RESOLVED' | 'REJECTED';
  detectedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: 'CITIZEN' | 'SURVEYOR' | 'DOLR_VERIFIER' | 'ADMIN' | 'SYSTEM_AI';
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VALIDATE' | 'RESOLVE_CONFLICT' | 'OVERRIDE';
  entityType: 'PARCEL' | 'BUILDING' | 'VERTICAL_UNIT' | 'UNDERGROUND_ASSET' | 'VALIDATION_LOG';
  entityId: string;
  summary: string;
  previousState?: any;
  newState?: any;
  hashSignature: string; // SHA-256 for audit immutability
}

export interface AccessLog {
  id: string;
  role: string;
  endpoint: string;
  ulpinId?: string;
  timestamp: string;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: 'CITIZEN' | 'SURVEYOR' | 'DOLR_VERIFIER' | 'ADMIN';
  department: string;
  token?: string;
}

/**
 * 3D ULPIN Helper Utilities
 */
export function formatUlpin3D(baseUlpin: string, domain: DomainCode, level: number, unitCode: string): string {
  const sign = level >= 0 ? '+' : '-';
  const absLevel = Math.abs(level).toString().padStart(2, '0');
  const levelFormatted = level === 0 ? '00' : `${sign}${absLevel}`;
  return `${baseUlpin.trim().toUpperCase()}.${domain}${levelFormatted}-${unitCode.trim().toUpperCase()}`;
}

export function parseUlpin3D(ulpinString: string): ParsedUlpin3D | null {
  if (!ulpinString) return null;
  // Regex: 10-18 base alphanumeric chars, dot, domain (G|A|U|T|S), level (+01, -02, 00, 01), hyphen, unit
  const regex = /^([A-Z0-9]{10,18})\.([GAUTS])([+-]?\d{2})-([A-Z0-9_-]+)$/i;
  const match = ulpinString.trim().toUpperCase().match(regex);
  if (!match) return null;

  const baseUlpin = match[1];
  const domainCode = match[2] as DomainCode;
  const levelRaw = match[3];
  const unitCode = match[4];
  const levelNumber = parseInt(levelRaw, 10);

  return {
    baseUlpin,
    domainCode,
    levelCode: levelRaw,
    levelNumber,
    unitCode,
    rawString: ulpinString.toUpperCase()
  };
}

export interface AccessLog {
  id: string;
  role: string;
  endpoint: string;
  ulpinId?: string;
  timestamp: string;
}

export type ChangeEventType = 
  | 'FOOTPRINT_CHANGE'
  | 'VOLUME_CHANGE'
  | 'LANDUSE_CHANGE'
  | 'DEMOLITION'
  | 'NEW_CONSTRUCTION';

export interface ChangeEvent {
  id: string;
  propertyId: string; // ulpin or buildingId
  detectedDate: string; // YYYY-MM-DD
  changeType: ChangeEventType;
  oldValue: string;
  newValue: string;
  confidence: number; // 0 to 1
  source: string; // e.g. Sentinel-2, Bhuvan, Drone
  status: 'VERIFIED' | 'REVIEW_REQUIRED' | 'REJECTED';
}

export interface PropertyVersion {
  versionId: string;
  propertyId: string;
  timestamp: string;
  floorCount: number;
  landUse: UseClassification;
  geometry: GeoPolygon2D;
  source: string;
}

/**
 * =======================================================================
 * Unified Land Event & Conflict Engine Models
 * =======================================================================
 */

export type LandEventCategory = 'EVENT' | 'CONFLICT' | 'VERIFICATION';

export type LandActionType = 'CREATE' | 'SUBDIVIDE' | 'TRANSFER' | 'MODIFY';
export type LandConflictType = 'BOUNDARY' | 'VERTICAL' | 'UNDERGROUND' | 'SETBACK';
export type LandVerificationType = 'HASH' | 'BLOCKCHAIN' | 'AUDIT';

export type LandEventType = LandActionType | LandConflictType | LandVerificationType;

export type LandEventStatus = 
  | 'PENDING' 
  | 'COMPLETED' 
  | 'VERIFIED' 
  | 'FAILED' 
  | 'OPEN' 
  | 'IN_REVIEW' 
  | 'RESOLVED' 
  | 'REJECTED';

export type BlockchainVerificationStatus = 
  | 'NOT_ANCHORED' 
  | 'PENDING' 
  | 'VERIFIED' 
  | 'MISMATCH' 
  | 'FAILED';

export type LandEventSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface LandEvent {
  id: string;
  ulpin: string;
  parcelId?: string;
  unitId?: string;
  parentId?: string; // e.g. parent ULPIN / parcel during subdivision
  type: LandEventType;
  category: LandEventCategory;
  status: LandEventStatus;
  severity?: LandEventSeverity;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
  resolvedAt?: string;
  transactionHash?: string;
  recordHash?: string;
  blockNumber?: number;
  blockchainStatus?: BlockchainVerificationStatus;
}
