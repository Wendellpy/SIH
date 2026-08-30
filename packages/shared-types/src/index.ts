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
