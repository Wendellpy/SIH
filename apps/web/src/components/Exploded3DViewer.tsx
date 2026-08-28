'use client';

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore } from '@/lib/store';
import { SAMPLE_BUILDINGS, SAMPLE_VERTICAL_UNITS, SAMPLE_PARCELS } from '@sih/sample-data';
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
  AlertCircle
} from 'lucide-react';

interface UnitMeshProps {
  unit: VerticalUnit;
  floorOffset: number;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: (unit: VerticalUnit) => void;
  onHover: (unit: VerticalUnit | null) => void;
}

const UnitMesh: React.FC<UnitMeshProps> = ({
  unit,
  floorOffset,
  isSelected,
  isHovered,
  onSelect,
  onHover,
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

  const width = unit.carpetAreaSqm > 600 ? 5.2 : 3.8;
  const depth = 3.6;
  const height = 0.85;
  const isLeft = unit.unitCode.endsWith('1') || unit.unitCode.endsWith('A');
  const xOffset = isLeft ? -2.2 : 2.2;
  const yPos = floorOffset;

  useFrame((state) => {
    if (meshRef.current && isConflict) {
      const scale = 1 + Math.sin(state.clock.getElapsedTime() * 4) * 0.04;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group position={[xOffset, yPos, 0]}>
      <mesh
        ref={meshRef}
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
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={isSelected ? 0.95 : (isHovered ? 0.9 : (isConflict ? 0.85 : 0.65))}
          roughness={0.2}
          metalness={0.1}
          emissive={isConflict ? '#7f1d1d' : (isSelected ? '#0369a1' : (isHovered ? '#0284c7' : '#000000'))}
          emissiveIntensity={isConflict ? 0.8 : (isSelected ? 0.6 : (isHovered ? 0.4 : 0))}
        />
      </mesh>

      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(width, height, depth)]} />
        <lineBasicMaterial color={isSelected || isConflict ? '#ffffff' : '#38bdf8'} linewidth={1} transparent opacity={0.5} />
      </lineSegments>

      {(isSelected || isHovered || isConflict) && (
        <Html position={[0, height / 2 + 0.3, 0]} center distanceFactor={18}>
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
  explodedDist: number;
  selectedUnit: VerticalUnit | null;
  hoveredUnit: VerticalUnit | null;
  onSelectUnit: (u: VerticalUnit) => void;
  onHoverUnit: (u: VerticalUnit | null) => void;
}> = ({
  buildingUnits,
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
        const floorOffset = floorNum * (1.2 * explodedDist);

        return (
          <group key={floorNum}>
            <mesh position={[0, floorOffset - 0.45, 0]} receiveShadow>
              <boxGeometry args={[9.5, 0.15, 6.5]} />
              <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.5} transparent opacity={0.8} />
            </mesh>

            <Html position={[-5.8, floorOffset - 0.4, 0]} center distanceFactor={22}>
              <div className="px-1.5 py-0.5 rounded bg-surface-200/90 text-slate-300 border border-white/10 text-[9px] font-mono whitespace-nowrap shadow">
                {floorNum === 0 ? 'Plinth (G)' : floorNum < 0 ? `Basement ${floorNum}` : `Floor +${floorNum}`}
              </div>
            </Html>

            {units.map(unit => (
              <UnitMesh
                key={unit.id}
                unit={unit}
                floorOffset={floorOffset}
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

const UndergroundTubes: React.FC<{ activeIds: number[] }> = ({ activeIds }) => {
  if (activeIds.length === 0) return null;

  const tubes = [];
  
  // Sewer / Drainage
  if (activeIds.includes(4) || activeIds.includes(5)) {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-15, -4, -10),
      new THREE.Vector3(0, -4, 0),
      new THREE.Vector3(15, -4, 10),
    ]);
    tubes.push(<mesh key="sewer"><tubeGeometry args={[path, 20, 0.4, 8, false]} /><meshStandardMaterial color="#a855f7" metalness={0.6} roughness={0.2} /></mesh>);
  }

  // Storm Water
  if (activeIds.includes(6) || activeIds.includes(7)) {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-15, -2, 5),
      new THREE.Vector3(15, -2, 5),
    ]);
    tubes.push(<mesh key="swd"><tubeGeometry args={[path, 20, 0.6, 8, false]} /><meshStandardMaterial color="#10b981" metalness={0.3} roughness={0.4} /></mesh>);
  }

  // Generic Pipeline
  if (activeIds.includes(55)) {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(5, -3, -15),
      new THREE.Vector3(5, -3, 15),
    ]);
    tubes.push(<mesh key="pipe"><tubeGeometry args={[path, 20, 0.25, 8, false]} /><meshStandardMaterial color="#38bdf8" metalness={0.8} roughness={0.1} /></mesh>);
  }

  // Tunnel
  if (activeIds.includes(310) || activeIds.includes(313)) {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-10, -12, -15),
      new THREE.Vector3(-5, -12, 0),
      new THREE.Vector3(-10, -12, 15),
    ]);
    tubes.push(<mesh key="tunnel"><tubeGeometry args={[path, 20, 2.5, 16, false]} /><meshStandardMaterial color="#f59e0b" metalness={0.2} roughness={0.8} /></mesh>);
  }

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

    // Determine building use pattern from name
    const isResidential = bldg.name.includes('Residen') || bldg.name.includes('Villa') || bldg.name.includes('Apartment');
    const isMixed = bldg.numFloors > 5;

    const startFloor = -(bldg.numBasements || 0);

    // Generate floors from startFloor (negative for basements) up to displayFloors
    // We treat 0 as Ground/Plinth
    for (let f = startFloor; f <= displayFloors; f++) {
      // For z index calculation, treat basement as below plinth
      const floorIdx = f < 0 ? f : f;
      const zMin = bldg.plinthElevationM + floorIdx * 3.8;
      const zMax = bldg.plinthElevationM + (floorIdx + 1) * 3.8;

      // Generate 2 units per floor (left wing A, right wing B)
      for (const wing of ['A', 'B'] as const) {
        let uCode = '';
        if (f === 0) uCode = `G0${wing === 'A' ? 1 : 2}`;
        else if (f < 0) uCode = `B${Math.abs(f)}0${wing === 'A' ? 1 : 2}`;
        else uCode = `F${f.toString().padStart(2, '0')}${wing}`;

        let useType: 'Commercial' | 'Residential' | 'Recreational' | 'Utility' = isResidential ? 'Residential' : 'Commercial';
        if (f < 0) useType = 'Utility';
        else if (isMixed) {
          if (f <= 2) useType = 'Commercial';
          else if (f === displayFloors) useType = 'Recreational';
          else useType = 'Residential';
        }

        const carpetArea = wing === 'A' ? 520 + Math.floor(Math.abs(f) * 15) : 480 + Math.floor(Math.abs(f) * 12);

        // Use building footprint coordinates if available
        const coords = bldg.footprint?.coordinates?.[0]?.[0] || [72.8280, 18.9960];
        const lng = coords[0];
        const lat = coords[1];

        generated.push({
          id: `unit-${bldg.id}-f${f}-${wing}`,
          buildingId: bldg.id,
          parcelId: parcel.id,
          ulpin3D: formatUlpin3D(ulpinBase, 'A', f, uCode),
          domainCode: 'A',
          levelCode: f === 0 ? 'G' : f < 0 ? `B${Math.abs(f)}` : `+${f.toString().padStart(2, '0')}`,
          unitCode: uCode,
          floorNumber: f,
          unitName: `${bldg.name} - ${wing === 'A' ? 'Wing A' : 'Wing B'} ${f === 0 ? 'Ground Floor' : f < 0 ? 'Basement ' + Math.abs(f) : 'Floor ' + f}`,
          useType,
          ownerName: f <= 2 && f >= 0 ? 'Mumbai Commercial Holdings Pvt. Ltd.' : `Resident Owner ${f}${wing}`,
          ownerId: `${isResidential ? 'AADH' : 'CORP'}-MH-${4000 + f * 2 + (wing === 'B' ? 1 : 0)}`,
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

          <BuildingScene
            buildingUnits={bldgUnits}
            explodedDist={explodedDistance}
            selectedUnit={selectedUnit}
            hoveredUnit={hoveredUnit}
            onSelectUnit={(u) => setSelectedUnit(u)}
            onHoverUnit={(u) => setHoveredUnit(u)}
          />

          <UndergroundTubes activeIds={activeUndergroundLayerIds} />

          <OrbitControls 
            enableDamping 
            dampingFactor={0.05} 
            maxPolarAngle={Math.PI / 2 + 0.1} 
            minDistance={6} 
            maxDistance={200} 
          />
        </Canvas>

        {/* Building Info & Back to Map */}
        <div className="absolute top-5 left-5 glass-panel rounded-2xl p-4 max-w-sm pointer-events-auto space-y-3 shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('MAPLIBRE_3D')}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-all duration-200 hover:-translate-x-1"
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
          <div className="pt-2 border-t border-white/10">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Switch Drill-Down:</label>
            <select
              value={bldg.id}
              onChange={(e) => {
                const found = SAMPLE_BUILDINGS.find(b => b.id === e.target.value);
                if (found) setSelectedBuilding(found);
                // Also check if it's the current selected (dynamic) building
                if (selectedBuilding && selectedBuilding.id === e.target.value) return;
              }}
              className="mt-1.5 w-full bg-white/5 text-slate-200 text-xs rounded-lg border border-white/10 px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer transition-colors hover:bg-white/10"
            >
              {/* Show current dynamic building first if it's not in SAMPLE_BUILDINGS */}
              {bldg.id.startsWith('osm-') && (
                <option value={bldg.id}>
                  📍 {bldg.name} ({bldg.roofHeightM}m, {bldg.numFloors}F)
                </option>
              )}
              {SAMPLE_BUILDINGS.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.roofHeightM}m, {b.numFloors}F)
                </option>
              ))}
            </select>
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
        <div className="absolute bottom-4 left-4 glass-panel rounded-xl p-3 border border-white/10 flex items-center gap-3 shadow-2xl pointer-events-auto">
          <Sliders className="w-4 h-4 text-brand-primary" />
          <div className="flex flex-col gap-0.5">
            <div className="flex justify-between text-[11px] font-medium text-slate-200">
              <span>Vertical Floor Separation</span>
              <span className="font-mono text-cyan-300">{(explodedDistance * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min={0.3}
              max={3.0}
              step={0.1}
              value={explodedDistance}
              onChange={(e) => setExplodedDistance(parseFloat(e.target.value))}
              className="w-48 h-1.5 bg-surface-200 rounded-lg appearance-none cursor-pointer accent-brand-primary"
            />
          </div>

          <button
            onClick={() => setExplodedDistance(1.8)}
            title="Reset Explosion"
            className="p-1.5 rounded-lg bg-surface-100 hover:bg-surface-200 text-slate-300 border border-white/10"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
