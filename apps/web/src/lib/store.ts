import { create } from 'zustand';
import { 
  Parcel, 
  Building, 
  VerticalUnit, 
  UndergroundAsset, 
  TopologyValidationLog, 
  AuditLog, 
  AIJob,
  ChangeEvent,
  MiningArea
} from '@sih/shared-types';
import { 
  SAMPLE_PARCELS, 
  SAMPLE_BUILDINGS, 
  SAMPLE_VERTICAL_UNITS, 
  SAMPLE_UNDERGROUND_ASSETS, 
  SAMPLE_TOPOLOGY_LOGS, 
  SAMPLE_AUDIT_LOGS,
  SAMPLE_MINING_AREAS
} from '@sih/sample-data';

export type MumbaiRegionKey = 'ALL' | 'BKC' | 'NARIMAN' | 'WORLI' | 'ANDHERI' | 'POWAI';

export interface AppState {
  // Navigation & View Modes
  activeTab: 'MAP_3D' | 'MAPLIBRE_3D' | 'EXPLODED_3D' | 'AI_STUDIO' | 'ADMIN_PORTAL' | 'AUDIT_LEDGER' | 'MAHARASHTRA' | 'MINING';
  setActiveTab: (tab: 'MAP_3D' | 'MAPLIBRE_3D' | 'EXPLODED_3D' | 'AI_STUDIO' | 'ADMIN_PORTAL' | 'AUDIT_LEDGER' | 'MAHARASHTRA' | 'MINING') => void;

  // Role-Based Access Views
  currentRole: 'revenue' | 'engineer' | 'utility';
  setCurrentRole: (role: 'revenue' | 'engineer' | 'utility') => void;

  // Selected Entities
  selectedParcel: Parcel | null;
  setSelectedParcel: (parcel: Parcel | null) => void;
  
  selectedBuilding: Building | null;
  setSelectedBuilding: (building: Building | null) => void;

  selectedUnit: VerticalUnit | null;
  setSelectedUnit: (unit: VerticalUnit | null) => void;

  selectedUnderground: UndergroundAsset | null;
  setSelectedUnderground: (asset: UndergroundAsset | null) => void;

  selectedMiningArea: MiningArea | null;
  setSelectedMiningArea: (area: MiningArea | null) => void;

  // Region & Category Filters
  selectedRegion: MumbaiRegionKey;
  setSelectedRegion: (region: MumbaiRegionKey) => void;

  flyToTarget: { lng: number; lat: number; zoom?: number; pitch?: number; bearing?: number } | null;
  setFlyToTarget: (target: { lng: number; lat: number; zoom?: number; pitch?: number; bearing?: number } | null) => void;

  // Layer Toggles
  layers: {
    parcels: boolean;
    buildings: boolean;
    verticalUnits: boolean;
    underground: boolean;
    undergroundUtilities: boolean;
    undergroundRoadwork: boolean;
    satellite: boolean;
    terrain: boolean;
    mybmc: boolean;
    mining: boolean;
  };
  activeUndergroundLayerIds: number[];
  toggleLayer: (layer: keyof AppState['layers']) => void;
  toggleUndergroundLayerId: (id: number) => void;

  // Vertical Floor & Depth Scrubber
  scrubber: {
    enabled: boolean;
    mode: 'FLOORS' | 'DEPTH';
    currentFloor: number; // 0 to 88
    maxFloor: number;
    currentDepthM: number; // 0 to -30m
    maxDepthM: number;
  };
  setScrubberFloor: (floor: number) => void;
  setScrubberDepth: (depthM: number) => void;
  setScrubberMode: (mode: 'FLOORS' | 'DEPTH') => void;
  toggleScrubber: (enabled?: boolean) => void;

  // Exploded View Controls
  explodedDistance: number; // 0.3 to 3.0
  setExplodedDistance: (dist: number) => void;

  // Universal Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // AI Pipeline Studio Job
  currentJob: AIJob | null;
  setCurrentJob: (job: AIJob | null) => void;

  // Topology Validation
  topologyLogs: TopologyValidationLog[];
  resolveConflict: (logId: string) => void;

  // Audit Logs
  auditLogs: AuditLog[];
  addAuditLog: (log: AuditLog) => void;

  // Dynamic Custom Parcel Creation
  customParcels: Parcel[];
  addCustomParcel: (parcel: Parcel, building?: Building) => void;

  // Reset to Global Mumbai View
  resetSelection: () => void;

  // Active searched parcel geometry
  searchedParcelGeoJSON: any | null;
  setSearchedParcelGeoJSON: (geo: any | null) => void;

  // 4D Temporal GIS State
  temporalYear: number;
  setTemporalYear: (year: number) => void;

  // Flood Simulation
  floodSimulation: {
    active: boolean;
    waterLevelM: number;
    polygon?: any;
  };
  setFloodSimulation: (active: boolean, waterLevelM?: number, polygon?: any) => void;

  // Mock Change Events
  changeEvents: ChangeEvent[];
  // Map State Persistence
  mapViewState: { lng: number; lat: number; zoom: number; pitch: number; bearing: number } | null;
  setMapViewState: (state: { lng: number; lat: number; zoom: number; pitch: number; bearing: number } | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  activeTab: 'MAPLIBRE_3D', // Default to the requested MapLibre 3D Vector view!
  setActiveTab: (tab) => set({ activeTab: tab }),

  mapViewState: null,
  setMapViewState: (state) => set({ mapViewState: state }),

  currentRole: 'revenue',
  setCurrentRole: (role) => set({ currentRole: role }),

  selectedParcel: SAMPLE_PARCELS[0],
  setSelectedParcel: (parcel) => set({ selectedParcel: parcel }),

  selectedBuilding: SAMPLE_BUILDINGS[0],
  setSelectedBuilding: (building) => {
    set({ selectedBuilding: building });
    if (building) {
      const parcel = SAMPLE_PARCELS.find(p => p.id === building.parcelId) || null;
      set({ selectedParcel: parcel });
    }
  },

  selectedUnit: null,
  setSelectedUnit: (unit) => set({ selectedUnit: unit }),

  selectedUnderground: null,
  setSelectedUnderground: (asset) => set({ selectedUnderground: asset }),

  selectedMiningArea: null,
  setSelectedMiningArea: (area) => set({ selectedMiningArea: area }),

  selectedRegion: 'ALL',
  setSelectedRegion: (region) => set({ selectedRegion: region }),

  flyToTarget: null,
  setFlyToTarget: (target) => set({ flyToTarget: target }),

  layers: {
    parcels: false,
    buildings: true,
    verticalUnits: true,
    underground: false,
    undergroundUtilities: false,
    undergroundRoadwork: false,
    satellite: false,
    terrain: false,
    mybmc: true,
    mining: true,
  },
  activeUndergroundLayerIds: [],
  toggleLayer: (layer) =>
    set((state) => ({
      layers: { ...state.layers, [layer]: !state.layers[layer] },
    })),
  toggleUndergroundLayerId: (id) =>
    set((state) => {
      const exists = state.activeUndergroundLayerIds.includes(id);
      return {
        activeUndergroundLayerIds: exists
          ? state.activeUndergroundLayerIds.filter((lid) => lid !== id)
          : [...state.activeUndergroundLayerIds, id],
      };
    }),

  scrubber: {
    enabled: true,
    mode: 'FLOORS',
    currentFloor: 25,
    maxFloor: 88,
    currentDepthM: 0,
    maxDepthM: 30,
  },
  setScrubberFloor: (floor) =>
    set((state) => ({
      scrubber: { ...state.scrubber, currentFloor: floor },
    })),
  setScrubberDepth: (depthM) =>
    set((state) => ({
      scrubber: { ...state.scrubber, currentDepthM: depthM },
    })),
  setScrubberMode: (mode) =>
    set((state) => ({
      scrubber: { ...state.scrubber, mode },
    })),
  toggleScrubber: (enabled) =>
    set((state) => ({
      scrubber: {
        ...state.scrubber,
        enabled: enabled !== undefined ? enabled : !state.scrubber.enabled,
      },
    })),

  explodedDistance: 1.8,
  setExplodedDistance: (dist) => set({ explodedDistance: dist }),

  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  currentJob: null,
  setCurrentJob: (job) => set({ currentJob: job }),

  topologyLogs: SAMPLE_TOPOLOGY_LOGS,
  resolveConflict: (logId) =>
    set((state) => {
      const updated = state.topologyLogs.map((l) =>
        l.id === logId
          ? {
              ...l,
              status: 'RESOLVED' as const,
              resolvedAt: new Date().toISOString(),
              resolvedBy: 'DoLR Senior Verifier',
            }
          : l
      );
      return { topologyLogs: updated };
    }),

  auditLogs: SAMPLE_AUDIT_LOGS,
  addAuditLog: (log) =>
    set((state) => ({ auditLogs: [log, ...state.auditLogs] })),

  customParcels: [],
  addCustomParcel: (parcel, building) =>
    set((state) => {
      SAMPLE_PARCELS.unshift(parcel);
      if (building) {
        SAMPLE_BUILDINGS.unshift(building);
      }
      return {
        customParcels: [parcel, ...state.customParcels],
        selectedParcel: parcel,
        selectedBuilding: building || null,
      };
    }),

  resetSelection: () =>
    set({
      selectedBuilding: null,
      selectedUnit: null,
      selectedUnderground: null,
      selectedMiningArea: null,
      selectedRegion: 'ALL',
      searchedParcelGeoJSON: null,
    }),

  searchedParcelGeoJSON: null,
  setSearchedParcelGeoJSON: (geo) => set({ searchedParcelGeoJSON: geo }),

  temporalYear: 2026,
  setTemporalYear: (year) => set({ temporalYear: year }),

  floodSimulation: {
    active: false,
    waterLevelM: 0,
    polygon: {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [72.7, 18.8],
            [73.1, 18.8],
            [73.1, 19.3],
            [72.7, 19.3],
            [72.7, 18.8]
          ]]
        }
      }]
    },
  },
  setFloodSimulation: (active, waterLevelM, polygon) => 
    set((state) => ({ 
      floodSimulation: { 
        active, 
        waterLevelM: waterLevelM ?? state.floodSimulation.waterLevelM,
        polygon: polygon !== undefined ? polygon : state.floodSimulation.polygon
      } 
    })),

  changeEvents: [
    {
      id: 'CH-00192',
      propertyId: 'bkc-fintech-tower',
      detectedDate: '2024-11-17',
      changeType: 'FOOTPRINT_CHANGE',
      oldValue: '1,200 m²',
      newValue: '1,680 m²',
      confidence: 0.87,
      source: 'Sentinel-2 + Bhuvan 2D',
      status: 'REVIEW_REQUIRED'
    },
    {
      id: 'CH-00193',
      propertyId: 'andheri-nesco-it-park',
      detectedDate: '2023-05-10',
      changeType: 'NEW_CONSTRUCTION',
      oldValue: '0 Floors',
      newValue: '4 Floors',
      confidence: 0.91,
      source: 'Copernicus Sentinel-2',
      status: 'VERIFIED'
    }
  ]
}));
