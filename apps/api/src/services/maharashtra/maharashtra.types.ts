export interface ApiResult<T> {
  success: boolean;
  source: 'maharashtra-government' | 'mock' | 'system';
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface District {
  id: string;
  name: string;
  sourceId: string;
}

export interface Taluka {
  id: string;
  districtId: string;
  name: string;
  sourceId: string;
}

export interface Village {
  id: string;
  talukaId: string;
  name: string;
  sourceId: string;
}

export interface ULPINDetails {
  ulpin: string;
  district: string;
  taluka: string;
  village: string;
  surveyNumber: string;
  geometry: any | null; // GeoJSON or null
}

export interface ParcelGeometry {
  type: 'Feature';
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
  properties: Record<string, any>;
}

export interface ParcelDetails {
  identifier: string;
  attributes: Record<string, any>;
  geometry?: ParcelGeometry;
}

export interface RoRRecord {
  surveyNumber: string;
  owners: string[];
  areaSqm: number;
  status: string;
}

export interface MutationRecord {
  mutationId: string;
  ulpin: string;
  status: string;
  details: Record<string, any>;
}
