'use client';

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '@/lib/store';
import { SAMPLE_BUILDINGS, SAMPLE_VERTICAL_UNITS, SAMPLE_PARCELS, SAMPLE_UNDERGROUND_ASSETS } from '@sih/sample-data';
import { VerticalUnit, formatUlpin3D } from '@sih/shared-types';
import { 
  Maximize2, 
  Layers, 
  Eye, 
  ShieldAlert, 
  CheckCircle2, 
  Sliders, 
  Compass,
  RotateCcw,
  Sparkles,
  Building2,
  ArrowLeft,
  MapPin,
  AlertCircle,
  ChevronDown,
  Check,
  Search
} from 'lucide-react';

import * as turf from '@turf/turf';

/* ─── Custom Building Select (Glassmorphism) ─── */
const BuildingSelect: React.FC<{
  buildings: any[];
  value: string;
  onChange: (id: string) => void;
}> = ({ buildings, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedLabel = buildings.find(b => b.id === value)?.name;
  const filtered = buildings.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} className="relative mt-1.5">
      <button
        type="button"
        onClick={() => { setOpen(o => !o); setSearch(''); }}
        className={`
          w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-medium
          bg-black/40 border backdrop-blur-md transition-all
          ${open ? 'border-cyan-500/50 ring-1 ring-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'border-white/10 hover:border-white/20'}
          cursor-pointer
        `}
      >
        <span className="flex items-center gap-2 truncate">
          <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          {selectedLabel ? (
            <span className="text-slate-200 truncate">{selectedLabel}</span>
          ) : (
            <span className="text-slate-500">Select Building</span>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full bg-[#0f1219] border border-white/10 rounded-xl shadow-2xl overflow-hidden" style={{ minWidth: '320px' }}>
          <div className="p-2 border-b border-white/5">
            <div className="flex items-center gap-2 px-3 py-2 bg-black/40 rounded-lg border border-white/5">
              <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search buildings..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto py-1" style={{ willChange: 'transform' }}>
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-xs text-slate-500 text-center">No buildings found</div>
            ) : (
              filtered.map(b => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => { onChange(b.id); setOpen(false); }}
                  className={`
                    w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors
                    ${b.id === value
                      ? 'bg-cyan-500/10 text-cyan-300'
                      : 'text-slate-300 hover:bg-white/5 hover:text-slate-100'
                    }
                  `}
                >
                  <span className="truncate">{b.name} <span className="text-slate-500 text-xs">({b.roofHeightM}m, {b.numFloors}F)</span></span>
                  {b.id === value && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

function sliceBuildingFootprint(coordinates: any[], numUnits: number) {
  // Fallback generic square if invalid
  const getFallback = () => {
    const slices = [];
    for(let i=0; i<numUnits; i++) {
      const shape = new THREE.Shape();
      shape.moveTo(-4 + i*(8/numUnits), -4);
      shape.lineTo(-4 + (i+1)*(8/numUnits), -4);
      shape.lineTo(-4 + (i+1)*(8/numUnits), 4);
      shape.lineTo(-4 + i*(8/numUnits), 4);
      shape.lineTo(-4 + i*(8/numUnits), -4);
      slices.push(shape);
    }
    const baseShape = new THREE.Shape();
    baseShape.moveTo(-4,-4); baseShape.lineTo(4,-4); baseShape.lineTo(4,4); baseShape.lineTo(-4,4); baseShape.lineTo(-4,-4);
    return { slices, baseShape };
  };

  if (!coordinates || !coordinates[0] || coordinates[0].length < 3) return getFallback();
  
  let polyCoords = [...coordinates[0]];
  
  // Turf requires closed polygons (first and last coordinate must be strictly equal)
  const firstPt = polyCoords[0];
  const lastPt = polyCoords[polyCoords.length - 1];
  if (firstPt[0] !== lastPt[0] || firstPt[1] !== lastPt[1]) {
    polyCoords.push([...firstPt]);
  }
  
  if (polyCoords.length < 4) return getFallback();

  try {
    let rawPoly = turf.polygon([polyCoords]);
    
    // EXTREMELY CRITICAL: MapLibre polygons are often clockwise.
    // Turf 7 (polyclip) STRICTLY requires CCW (right-hand rule). 
    // If not rewound, intersection will crash or return empty.
    rawPoly = turf.rewind(rawPoly, { reverse: true, mutate: true });
    
    const centroid = turf.centroid(rawPoly);
    const [cx, cy] = centroid.geometry.coordinates;

    // Convert to local Cartesian (Meters)
    const METERS_PER_DEGREE_LAT = 111320;
    const METERS_PER_DEGREE_LNG = 111320 * Math.cos(cy * Math.PI / 180);

    const localCoords = rawPoly.geometry.coordinates[0].map(([lng, lat]) => [
      (lng - cx) * METERS_PER_DEGREE_LNG,
      (lat - cy) * METERS_PER_DEGREE_LAT
    ]);

    let localPoly = turf.polygon([localCoords]);
    localPoly = turf.rewind(localPoly, { reverse: true, mutate: true });

    const bbox = turf.bbox(localPoly); // [minX, minY, maxX, maxY]
    
    const width = bbox[2] - bbox[0];
    const height = bbox[3] - bbox[1];
    
    const slices = [];
    const isHorizontalSplit = width > height;
    const step = (isHorizontalSplit ? width : height) / Math.max(1, numUnits);

    for (let i = 0; i < numUnits; i++) {
      const minX = isHorizontalSplit ? bbox[0] + i * step : bbox[0];
      const maxX = isHorizontalSplit ? bbox[0] + (i + 1) * step : bbox[2];
      const minY = isHorizontalSplit ? bbox[1] : bbox[1] + i * step;
      const maxY = isHorizontalSplit ? bbox[3] : bbox[1] + (i + 1) * step;

      // Expand bounding box slice slightly to prevent precision gaps
      let sliceBbox = turf.polygon([[[minX-0.1, minY-0.1], [maxX+0.1, minY-0.1], [maxX+0.1, maxY+0.1], [minX-0.1, maxY+0.1], [minX-0.1, minY-0.1]]]);
      sliceBbox = turf.rewind(sliceBbox, { reverse: true, mutate: true });
      const intersection = turf.intersect(turf.featureCollection([localPoly, sliceBbox]));
      
      if (intersection && intersection.geometry.type === 'Polygon') {
        const shape = new THREE.Shape();
        const coords = intersection.geometry.coordinates[0];
        coords.forEach((pt: number[], idx: number) => {
          if (idx === 0) shape.moveTo(pt[0], pt[1]);
          else shape.lineTo(pt[0], pt[1]);
        });
        slices.push(shape);
      } else if (intersection && intersection.geometry.type === 'MultiPolygon') {
         const shape = new THREE.Shape();
         const coords = intersection.geometry.coordinates[0][0]; // Take largest
         coords.forEach((pt: number[], idx: number) => {
           if (idx === 0) shape.moveTo(pt[0], pt[1]);
           else shape.lineTo(pt[0], pt[1]);
         });
         slices.push(shape);
      } else {
         // Empty shape fallback for this slice
         const shape = new THREE.Shape();
         shape.moveTo(minX, minY); shape.lineTo(maxX, minY); shape.lineTo(maxX, maxY); shape.lineTo(minX, maxY); shape.lineTo(minX, minY);
         slices.push(shape);
      }
    }

    const baseShape = new THREE.Shape();
    localCoords.forEach((pt, idx) => {
      if (idx === 0) baseShape.moveTo(pt[0], pt[1]);
      else baseShape.lineTo(pt[0], pt[1]);
    });

    return { slices, baseShape };
  } catch (err) {
    console.error("Turf slicing failed", err);
    return getFallback();
  }
}

interface UnitMeshProps {
  unit: VerticalUnit;
  floorOffset: number;
  floorHeight: number;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (unit: VerticalUnit) => void;
  onHover: (unit: VerticalUnit | null) => void;
  shape: THREE.Shape;
}

const UnitMesh: React.FC<UnitMeshProps> = ({
  unit,
  floorOffset,
  floorHeight,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  shape
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const isConflict = unit.validationStatus === 'CONFLICT';

  const color = useMemo(() => {
    if (isConflict) return '#ef4444'; // Red conflict alert
    if (unit.useType === 'Commercial') return '#0ea5e9'; // Sky blue
    if (unit.useType === 'Residential') return '#10b981'; // Emerald
    if (unit.useType === 'Recreational') return '#a855f7'; // Purple
    return '#f59e0b'; // Amber for parking/MEP
  }, [unit.useType, isConflict]);

  // Adjust depth slightly to prevent Z-fighting with the base plate when collapsed
  const height = Math.max(0.5, floorHeight - 0.15); 
  const yPos = floorOffset;

  const extrudeSettings = useMemo(() => ({
    depth: height,
    bevelEnabled: true,
    bevelSegments: 1,
    steps: 1,
    bevelSize: 0.05,
    bevelThickness: 0.05
  }), [height]);

  const geometry = useMemo(() => new THREE.ExtrudeGeometry(shape, extrudeSettings), [shape, extrudeSettings]);

  // Adjust position so the floor is at y=0 relative to the group
  // ExtrudeGeometry builds depth along Z axis, we need to rotate it so it lies flat (Y axis)
  // And we want the origin of the unit to be properly positioned

  useFrame((state) => {
    if (meshRef.current && isConflict) {
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 4) * 0.04;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={[0, yPos, 0]}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        rotation={[-Math.PI / 2, 0, 0]} // Rotate extruded shape to lay flat
        onClick={(e) => {
          e.stopPropagation();
          onSelect(unit);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(unit);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHover(null);
        }}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={color}
          transparent
          opacity={isSelected ? 0.95 : (isHovered ? 0.9 : (isConflict ? 0.85 : 0.65))}
          roughness={0.2}
          metalness={0.1}
          emissive={isConflict ? '#7f1d1d' : (isSelected ? '#0369a1' : (isHovered ? '#0284c7' : '#000000'))}
          emissiveIntensity={isConflict ? 0.8 : (isSelected ? 0.6 : (isHovered ? 0.4 : 0))}
          side={THREE.DoubleSide}
        />
      </mesh>

      <lineSegments rotation={[-Math.PI / 2, 0, 0]}>
        <edgesGeometry args={[geometry]} />
        <lineBasicMaterial color={isSelected || isConflict ? '#ffffff' : '#38bdf8'} linewidth={1} transparent opacity={0.5} />
      </lineSegments>

      {(isSelected || isHovered || isConflict) && (
        <Html position={[0, height + 0.3, 0]} center distanceFactor={18}>
          <div className={`px-2 py-1 rounded shadow-xl text-[10px] font-mono whitespace-nowrap pointer-events-none backdrop-blur-md border ${
            isConflict 
              ? 'bg-red-950/90 text-red-200 border-red-500 shadow-neon-red font-bold' 
              : 'bg-surface-100/90 text-white border-brand-primary/40'
          }`}>
            {isConflict ? '⚠️ CONFLICT: ' : ''}{unit.ulpin3D.split('.').pop()} ({unit.carpetAreaSqm}m²)
          </div>
        </Html>
      )}
    </group>
  );
};

const BuildingScene: React.FC<{
  buildingUnits: VerticalUnit[];
  building: any;
  explodedDist: number;
  selectedUnit: VerticalUnit | null;
  hoveredUnit: VerticalUnit | null;
  onSelectUnit: (u: VerticalUnit) => void;
  onHoverUnit: (u: VerticalUnit | null) => void;
}> = ({
  buildingUnits,
  building,
  explodedDist,
  selectedUnit,
  hoveredUnit,
  onSelectUnit,
  onHoverUnit
}) => {
  const floors = useMemo(() => {
    const map = new Map<number, VerticalUnit[]>();
    buildingUnits.forEach(u => {
      const arr = map.get(u.floorNumber) || [];
      arr.push(u);
      map.set(u.floorNumber, arr);
    });
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [buildingUnits]);

  // Compute base shape (floor plate) and per-floor slices
  const { baseShape, floorsData } = useMemo(() => {
    const getFallback = () => {
      const baseShape = new THREE.Shape();
      baseShape.moveTo(-4,-4); baseShape.lineTo(4,-4); baseShape.lineTo(4,4); baseShape.lineTo(-4,4); baseShape.lineTo(-4,-4);
      const floorsData = new Map<number, THREE.Shape[]>();
      for (const [floorNum, units] of floors) {
        const slices = [];
        const numUnits = units.length;
        for(let i=0; i<numUnits; i++) {
          const shape = new THREE.Shape();
          shape.moveTo(-4 + i*(8/numUnits), -4);
          shape.lineTo(-4 + (i+1)*(8/numUnits), -4);
          shape.lineTo(-4 + (i+1)*(8/numUnits), 4);
          shape.lineTo(-4 + i*(8/numUnits), 4);
          shape.lineTo(-4 + i*(8/numUnits), -4);
          slices.push(shape);
        }
        floorsData.set(floorNum, slices);
      }
      return { baseShape, floorsData };
    };

    if (!building || !building.footprint || !building.footprint.coordinates) return getFallback();
    
    // We compute the baseShape once based on 1 slice just to get the overall polygon
    const { baseShape } = sliceBuildingFootprint(building.footprint.coordinates, 1);
    
    // Then for each floor, we slice it into N units
    const floorsData = new Map<number, THREE.Shape[]>();
    for (const [floorNum, units] of floors) {
      const result = sliceBuildingFootprint(building.footprint.coordinates, units.length);
      floorsData.set(floorNum, result.slices);
    }
    
    return { baseShape, floorsData };
  }, [building, floors]);

  const actualFloorHeight = useMemo(() => {
    return (building && building.roofHeightM && building.numFloors) 
      ? Math.max(2.5, building.roofHeightM / Math.max(1, building.numFloors))
      : 3.8;
  }, [building]);

  const baseGeometry = useMemo(() => new THREE.ExtrudeGeometry(baseShape, { depth: 0.15, bevelEnabled: false }), [baseShape]);

  return (
    <group position={[0, -2, 0]}>
      {/* Ground Plate */}
      <mesh position={[0, -0.6, 0]} receiveShadow>
        <cylinderGeometry args={[8, 8.5, 0.4, 32]} />
        <meshStandardMaterial color="#0f172a" roughness={0.8} />
      </mesh>

      <gridHelper args={[18, 18, '#0ea5e9', '#1e293b']} position={[0, -0.38, 0]} />

      {/* Floating Floor Slices */}
      {floors.map(([floorNum, units]) => {
        // Precise vertical spacing based on true architectural floor height
        const floorOffset = floorNum * (actualFloorHeight * explodedDist);
        const shapes = floorsData.get(floorNum) || [];

        return (
          <group key={floorNum}>
            {/* The thin actual floor plate matching the real footprint */}
            <mesh geometry={baseGeometry} position={[0, floorOffset - 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.5} transparent opacity={0.8} side={THREE.DoubleSide} />
            </mesh>

            <Html position={[-5.8, floorOffset - 0.4, 0]} center distanceFactor={22}>
              <div className="px-1.5 py-0.5 rounded bg-surface-200/90 text-slate-300 border border-white/10 text-[9px] font-mono whitespace-nowrap shadow">
                {floorNum === 0 ? 'Plinth (G)' : floorNum < 0 ? `Basement ${floorNum}` : `Floor +${floorNum}`}
              </div>
            </Html>

            {units.map((unit, idx) => (
              <UnitMesh
                key={unit.id}
                unit={unit}
                shape={shapes[idx] || new THREE.Shape()}
                floorOffset={floorOffset}
                floorHeight={actualFloorHeight}
                isSelected={selectedUnit?.id === unit.id}
                isHovered={hoveredUnit?.id === unit.id}
                onSelect={onSelectUnit}
                onHover={onHoverUnit}
              />
            ))}
          </group>
        );
      })}
    </group>
  );
};

const UndergroundTubes: React.FC<{ activeIds: number[], buildingCentroid: [number, number] }> = ({ activeIds, buildingCentroid }) => {
  const [cx, cy] = buildingCentroid;
  const METERS_PER_DEGREE_LAT = 111320;
  const METERS_PER_DEGREE_LNG = 111320 * Math.cos((cy * Math.PI) / 180);

  const [liveAssets, setLiveAssets] = useState<any[]>([]);

  useEffect(() => {
    // Fetch live MCGM ESRI pipelines around the building centroid (approx 300m box)
    const fetchLivePipes = async () => {
      const margin = 0.003; // roughly 300m
      // ESRI bbox is minLng,minLat,maxLng,maxLat
      const bbox = `${cx - margin},${cy - margin},${cx + margin},${cy + margin}`;
      
      try {
        const fetchedAssets: any[] = [];
        
        await Promise.all(activeIds.map(async (id) => {
          const url = `https://prsrvgisapp.mcgm.gov.in/server/rest/services/mcgm/MCGMGIS_Departments_Master_All_Layers/MapServer/${id}/query?geometry=${bbox}&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=true&f=geojson&resultRecordCount=2000`;
          
          try {
            const rawGeojson = await fetch(url).then(r => r.json());
            
            if (rawGeojson && rawGeojson.features && rawGeojson.features.length > 0) {
              rawGeojson.features.forEach((feature: any, index: number) => {
                 let type = 'WATER_SUPPLY';
                 if ([4, 5, 6, 7].includes(id)) type = 'SEWER_DRAIN'; 
                 if ([1, 2].includes(id)) type = 'WATER_SUPPLY';
                 if (id === 55) type = 'GAS_PIPELINE';
                 if ([100, 101].includes(id)) type = 'TELECOM_FIBER';
                 if ([200, 201].includes(id)) type = 'POWER_HV';
                 if ([310, 313].includes(id)) type = 'METRO_TUNNEL';
                 
                 let coords = [];
                 if (feature.geometry?.type === 'LineString') {
                   coords = feature.geometry.coordinates;
                 } else if (feature.geometry?.type === 'MultiLineString') {
                   coords = feature.geometry.coordinates[0];
                 }

                 if (coords && coords.length >= 2) {
                   fetchedAssets.push({
                     id: `live-mcgm-${id}-${index}`,
                     assetType: type,
                     diameterMm: type === 'SEWER_DRAIN' ? 1200 : (type === 'METRO_TUNNEL' ? 6000 : 800),
                     coordinates3D: {
                       type: 'LineStringZ',
                       coordinates: coords.map((pt: any) => [pt[0], pt[1], type === 'SEWER_DRAIN' ? -3.0 : (type === 'METRO_TUNNEL' ? -15.0 : -2.0)])
                     }
                   });
                 }
              });
            }
          } catch (e) {
             console.error(`Failed to fetch live MCGM layer ${id}`, e);
          }
        }));
        
        setLiveAssets(fetchedAssets);
      } catch (err) {
        console.error('Failed to fetch live MCGM pipelines for exploded view', err);
      }
    };
    
    fetchLivePipes();
  }, [cx, cy, activeIds]);

  if (activeIds.length === 0) return null;

  const tubes: JSX.Element[] = [];
  const allAssets = [...SAMPLE_UNDERGROUND_ASSETS, ...liveAssets];

  allAssets.forEach(asset => {
    // Map internal Asset Types to UI Active IDs
    const isMatch = (
      (asset.assetType === 'SEWER_DRAIN' && (activeIds.includes(4) || activeIds.includes(5) || activeIds.includes(6) || activeIds.includes(7))) ||
      (asset.assetType === 'WATER_SUPPLY' && (activeIds.includes(1) || activeIds.includes(2))) ||
      (asset.assetType === 'POWER_HV' && (activeIds.includes(200) || activeIds.includes(201))) ||
      (asset.assetType === 'TELECOM_FIBER' && (activeIds.includes(100) || activeIds.includes(101))) ||
      (asset.assetType === 'GAS_PIPELINE' && activeIds.includes(55)) ||
      (asset.assetType === 'METRO_TUNNEL' && (activeIds.includes(310) || activeIds.includes(313)))
    );

    if (!isMatch) return;

    if (asset.coordinates3D && asset.coordinates3D.type === 'LineStringZ') {
      const coords = asset.coordinates3D.coordinates;
      const vectors = coords.map(([lng, lat, z]) => {
        const dx = (lng - cx) * METERS_PER_DEGREE_LNG;
        const dy = z; // Three.js Y is UP (Elevation)
        const dz = -(lat - cy) * METERS_PER_DEGREE_LAT; // Three.js -Z is North
        return new THREE.Vector3(dx, dy, dz);
      });

      if (vectors.length >= 2) {
        const path = new THREE.CatmullRomCurve3(vectors);
        
        let color = '#38bdf8';
        let radius = asset.diameterMm ? asset.diameterMm / 2000 : 0.5; // diameter in mm to radius in meters
        
        if (asset.assetType === 'SEWER_DRAIN') color = '#a855f7';
        else if (asset.assetType === 'WATER_SUPPLY') color = '#10b981';
        else if (asset.assetType === 'METRO_TUNNEL') color = '#f59e0b';
        else if (asset.assetType === 'GAS_PIPELINE') color = '#fbbf24';
        else if (asset.assetType === 'POWER_HV') color = '#eab308';
        else if (asset.assetType === 'TELECOM_FIBER') color = '#f43f5e';
        
        tubes.push(
          <mesh key={asset.id}>
            <tubeGeometry args={[path, 64, radius, 12, false]} />
            <meshStandardMaterial color={color} metalness={0.4} roughness={0.6} />
          </mesh>
        );
      }
    }
  });

  return (
    <group>
      {tubes}
    </group>
  );
};

export const Exploded3DViewer: React.FC = () => {
  const { 
    selectedBuilding, 
    setSelectedBuilding,
    selectedUnit, 
    setSelectedUnit, 
    explodedDistance, 
    setExplodedDistance,
    setActiveTab,
    activeUndergroundLayerIds
  } = useAppStore();

  const [hoveredUnit, setHoveredUnit] = useState<VerticalUnit | null>(null);
  const [showBuilding, setShowBuilding] = useState<boolean>(true);

  const bldg = selectedBuilding || SAMPLE_BUILDINGS[0];

  // Dynamically resolve or generate vertical units for selected building
  const bldgUnits = useMemo(() => {
    const existing = SAMPLE_VERTICAL_UNITS.filter(u => u.buildingId === bldg.id);
    if (existing.length > 0) return existing;

    // Generate dynamic floors for OSM or other buildings
    const generated: VerticalUnit[] = [];
    const parcel = SAMPLE_PARCELS.find(p => p.id === bldg.parcelId) || SAMPLE_PARCELS[0];
    const displayFloors = bldg.numFloors; // Render all floors
    const ulpinBase = parcel?.ulpin || `MH13BOM${bldg.id.replace(/\D/g, '').slice(0, 8).padEnd(8, '0')}`;

    // Determine building use pattern from MyBMC data (injected into name) or fallback
    let isResidential = true;
    if (bldg.name.includes('[Commercial]') || bldg.name.includes('[Office]')) isResidential = false;
    else if (bldg.name.includes('[Residential]')) isResidential = true;
    else isResidential = bldg.name.includes('Residen') || bldg.name.includes('Villa') || bldg.name.includes('Apartment');
    const isMixed = bldg.numFloors > 5 && bldg.name.includes('[Mixed');

    const startFloor = -(bldg.numBasements || 0);

    // Generate floors from startFloor (negative for basements) up to displayFloors
    // We treat 0 as Ground/Plinth
    for (let f = startFloor; f <= displayFloors; f++) {
      // For z index calculation, treat basement as below plinth
      const floorIdx = f < 0 ? f : f;
      const zMin = bldg.plinthElevationM + floorIdx * 3.8;
      const zMax = bldg.plinthElevationM + (floorIdx + 1) * 3.8;

      // Calculate footprint area to dynamically estimate realistic number of flats
      let estimatedUnits = 2; // Default fallback
      let footprintAreaSqm = 150; // Default fallback footprint
      
      if (bldg.footprint && bldg.footprint.coordinates) {
        try {
           // We ensure the polygon is closed for Turf.js
           let polyCoords = [...bldg.footprint.coordinates[0]];
           const firstPt = polyCoords[0];
           const lastPt = polyCoords[polyCoords.length - 1];
           if (firstPt[0] !== lastPt[0] || firstPt[1] !== lastPt[1]) {
             polyCoords.push([...firstPt]);
           }
           
           if (polyCoords.length >= 4) {
             const poly = turf.polygon([polyCoords]);
             footprintAreaSqm = turf.area(poly);
             // Assume an average flat + common area is ~65 sqm. 
             estimatedUnits = Math.max(1, Math.round(footprintAreaSqm / 65));
             
             // Cap at 12 to prevent extreme subdivision on massive commercial buildings
             estimatedUnits = Math.min(12, estimatedUnits);
            }
         } catch (e) {
           let hash = 0;
           const idStr = bldg.id || 'default';
           for (let i = 0; i < idStr.length; i++) {
             hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
           }
           estimatedUnits = 1 + (Math.abs(hash) % 4);
        }
      }
      
      const unitsPerFloor = estimatedUnits;

      for (let i = 1; i <= unitsPerFloor; i++) {
        let uCode = '';
        if (f === 0) uCode = `0${i}`;
        else if (f < 0) uCode = `B0${i}`;
        else uCode = `${f}${i}`;

        let useType: 'Commercial' | 'Residential' | 'Recreational' | 'Utility' = isResidential ? 'Residential' : 'Commercial';
        if (f < 0) useType = 'Utility';
        else if (isMixed) {
          if (f <= 2) useType = 'Commercial';
          else if (f === displayFloors) useType = 'Recreational';
          else useType = 'Residential';
        }

        // Determine realistic carpet area
        // 1. Start with the footprint area divided by number of units
        // 2. Adjust for common areas (loading factor): usually 30-40% of footprint is common area
        // 3. For commercial, add some variability. For higher floors, add a small premium.
        let baseUnitArea = footprintAreaSqm / unitsPerFloor;
        const loadingFactor = useType === 'Commercial' ? 0.65 : 0.70; // Carpet area is ~65-70% of footprint slice
        
        // Give slight variance to unit sizes on the same floor (e.g. Unit 1 might be 10% larger)
        const sizeVariance = i % 2 === 0 ? 0.95 : 1.05;
        
        let carpetArea = Math.round(baseUnitArea * loadingFactor * sizeVariance);
        
        // Add a premium for higher floors (+2 sqm per floor)
        carpetArea += Math.max(0, f * 2);
        
        // Enforce realistic bounds
        if (useType === 'Residential') {
           carpetArea = Math.max(25, Math.min(carpetArea, 300));
        } else if (useType === 'Commercial') {
           carpetArea = Math.max(40, carpetArea);
        } else {
           carpetArea = Math.max(15, carpetArea);
        }

        // Use building footprint coordinates if available
        const coords = bldg.footprint?.coordinates?.[0]?.[0] || [72.8280, 18.9960];
        const lng = coords[0];
        const lat = coords[1];

        generated.push({
          id: `unit-${bldg.id}-f${f}-u${i}`,
          buildingId: bldg.id,
          parcelId: parcel.id,
          ulpin3D: formatUlpin3D(ulpinBase, 'A', f, uCode),
          domainCode: 'A',
          levelCode: f === 0 ? 'G' : f < 0 ? `B${Math.abs(f)}` : `+${f.toString().padStart(2, '0')}`,
          unitCode: uCode,
          floorNumber: f,
          unitName: `${bldg.name} - Flat ${uCode} ${f === 0 ? '(Ground)' : f < 0 ? '(Basement)' : ''}`,
          useType,
          ownerName: f <= 2 && f >= 0 ? 'Mumbai Commercial Holdings Pvt. Ltd.' : `Resident Owner ${f}-${i}`,
          ownerId: `${isResidential ? 'AADH' : 'CORP'}-MH-${4000 + f * 5 + i}`,
          carpetAreaSqm: carpetArea,
          builtupAreaSqm: Math.round(carpetArea * 1.15),
          volumeCum: Math.round(carpetArea * 3.8),
          zMin,
          zMax,
          verticalDatum: 'WGS84 MSL (Plinth Datum)',
          bounds: {
            minLng: lng - 0.0001,
            maxLng: lng + 0.0001,
            minLat: lat - 0.0001,
            maxLat: lat + 0.0001,
            minZ: zMin,
            maxZ: zMax
          },
          validationStatus: Math.random() > 0.9 ? 'CONFLICT' : 'VALID', // ~10% chance of conflict
          provenance: bldg.simulated ? 'DRONE_LIDAR' : 'MAHARERA_PLAN',
          taxStatus: Math.random() > 0.15 ? 'PAID' : 'DUE',
          simulated: true,
          createdAt: '2026-01-20T10:00:00Z',
          updatedAt: '2026-08-20T14:30:00Z'
        });
      }
    }
    return generated;
  }, [bldg]);

  return (
    <div className="relative w-full h-full min-h-[580px] bg-gradient-to-b from-[#050811] via-[#090e1a] to-[#0d1424] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col">
      <div className="flex-1 w-full h-full relative">
        <Canvas
          shadows
          camera={{ position: [22, 20, 26], fov: 42 }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[15, 25, 15]} intensity={1.5} castShadow />
          <pointLight position={[-10, 10, -10]} intensity={0.8} color="#0ea5e9" />
          <pointLight position={[10, 10, 10]} intensity={0.5} color="#10b981" />

          {showBuilding && (
            <BuildingScene
              buildingUnits={bldgUnits}
              explodedDist={explodedDistance}
              selectedUnit={selectedUnit}
              hoveredUnit={hoveredUnit}
              onSelectUnit={(u) => setSelectedUnit(u)}
              onHoverUnit={(u) => setHoveredUnit(u)}
            />
          )}
          {!showBuilding && (
            <gridHelper args={[200, 200, '#0ea5e9', '#1e293b']} position={[0, -2.38, 0]} />
          )}

          {/* Calculate building centroid for relative projection */}
          {(() => {
            let cx = 72.8280;
            let cy = 18.9960;
            const coordinates = bldg.footprint?.coordinates;
            if (coordinates && coordinates[0] && coordinates[0].length >= 3) {
              let polyCoords = [...coordinates[0]];
              const firstPt = polyCoords[0];
              const lastPt = polyCoords[polyCoords.length - 1];
              if (firstPt[0] !== lastPt[0] || firstPt[1] !== lastPt[1]) {
                polyCoords.push([...firstPt]);
              }
              if (polyCoords.length >= 4) {
                let rawPoly = turf.polygon([polyCoords]);
                rawPoly = turf.rewind(rawPoly, { reverse: true, mutate: true });
                const centroid = turf.centroid(rawPoly);
                cx = centroid.geometry.coordinates[0];
                cy = centroid.geometry.coordinates[1];
              }
            }
            return (
              <UndergroundTubes 
                activeIds={activeUndergroundLayerIds.length > 0 ? activeUndergroundLayerIds : [4, 6, 55, 310]} 
                buildingCentroid={[cx, cy]} 
              />
            );
          })()}

          <OrbitControls 
            enableDamping 
            dampingFactor={0.05} 
            maxPolarAngle={Math.PI / 2 + 0.1} 
            minDistance={6} 
            maxDistance={200} 
          />
        </Canvas>

        {/* Building Info & Back to Map */}
        <div className="absolute top-5 left-5 glass-panel bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 max-w-sm pointer-events-auto space-y-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('MAPLIBRE_3D')}
              className="p-2 rounded-xl bg-white/[0.02] hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5 transition-all duration-200 hover:-translate-x-1"
              title="Back to Map"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="p-1.5 rounded-lg bg-brand-primary/20 text-brand-primary">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-bold text-white leading-tight truncate">
                {bldg.name}
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                {bldg.roofHeightM}m Height &bull; {bldg.numFloors} Floors &bull; {bldgUnits.length} Units
              </p>
            </div>
          </div>

          {/* Address / Coordinates if OSM building */}
          {bldg.simulated && bldg.address && (
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
              <MapPin className="w-3 h-3 text-cyan-400 flex-shrink-0" />
              <span className="truncate">{bldg.address}</span>
            </div>
          )}

          {/* Quick Switch Building Dropdown */}
          <div className="pt-3 border-t border-white/5">
            <label className="text-[11px] font-medium text-slate-500">Switch Drill-Down</label>
            <BuildingSelect
              buildings={[
                ...(bldg.id.startsWith('osm-') ? [bldg] : []),
                ...SAMPLE_BUILDINGS.filter(b => b.id !== bldg.id)
              ]}
              value={bldg.id}
              onChange={(id) => {
                const found = SAMPLE_BUILDINGS.find(b => b.id === id);
                if (found) setSelectedBuilding(found);
              }}
            />
          </div>
          
          {/* Toggle View Mode */}
          <div className="pt-3 border-t border-white/5">
            <button
              onClick={() => setShowBuilding(!showBuilding)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all border ${
                showBuilding 
                  ? 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 hover:bg-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
              }`}
            >
              {showBuilding ? 'Hide Buildings (Isolate Pipes)' : 'Show Buildings'}
            </button>
          </div>
        </div>

        {activeUndergroundLayerIds.length > 0 && (
          <div className="absolute top-5 right-5 glass-panel p-4 rounded-2xl border border-amber-500/30 bg-amber-950/20 shadow-[0_0_20px_rgba(245,158,11,0.15)] pointer-events-auto max-w-xs animate-in slide-in-from-right-4 fade-in duration-300">
            <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 mb-2 tracking-wide uppercase">
              <AlertCircle className="w-4 h-4" /> ⚠ Illustrative Depth Warning
            </div>
            <p className="text-[10px] text-slate-300 leading-relaxed font-mono">
              The 3D pipelines visualized below the building are placed at an illustrative default underground depth. The MCGM ArcGIS dataset does not contain surveyed engineering pipeline depth (Z-coordinates).
            </p>
          </div>
        )}

        {/* Floating Explode Slider HUD */}
        <div className="absolute bottom-5 left-5 glass-panel bg-black/40 backdrop-blur-xl rounded-xl p-3.5 border border-white/10 flex items-center gap-4 shadow-2xl pointer-events-auto">
          <Sliders className="w-4 h-4 text-slate-400" />
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[11px] font-medium text-slate-300">
              <span>Vertical Floor Separation</span>
              <span className="text-blue-400 font-medium">{(explodedDistance * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0.3}
              max={3.0}
              step={0.1}
              value={explodedDistance}
              onChange={(e) => setExplodedDistance(parseFloat(e.target.value))}
              className="w-48 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all"
            />
          </div>

          <button
            onClick={() => setExplodedDistance(1.8)}
            title="Reset Explosion"
            className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/10 text-slate-400 hover:text-slate-200 border border-white/5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
