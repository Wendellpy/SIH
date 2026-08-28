'use client';

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useAppStore, MumbaiRegionKey } from '@/lib/store';
import { 
  SAMPLE_PARCELS, 
  SAMPLE_BUILDINGS, 
  SAMPLE_UNDERGROUND_ASSETS 
} from '@sih/sample-data';
import { Building, Parcel, UndergroundAsset } from '@sih/shared-types';
import { 
  Layers, 
  MapPin, 
  Compass, 
  Eye, 
  Maximize2, 
  Cable, 
  Anchor, 
  Sparkles,
  Info,
  Navigation,
  Building2,
  Train
} from 'lucide-react';

interface Building3DProps {
  building: Building;
  isSelected: boolean;
  onSelect: (b: Building) => void;
  scrubberFloor: number;
  temporalYear: number;
  floodSimulation: { active: boolean; waterLevelM: number };
}

const Building3D: React.FC<Building3DProps> = ({
  building,
  isSelected,
  onSelect,
  scrubberFloor,
  temporalYear,
  floodSimulation
}) => {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  // Position mapping based on real Mumbai geographical sectors
  const pos = useMemo(() => {
    const id = building.id;
    if (id.includes('bkc-fintech')) return [-6, 0, -2];
    if (id.includes('bkc-diamond')) return [-3, 0, -3];
    if (id.includes('bkc-jio')) return [-8, 0, 1];
    if (id.includes('bkc-nse')) return [-5, 0, -5];

    if (id.includes('nariman-ocean')) return [8, 0, 10];
    if (id.includes('nariman-express')) return [11, 0, 12];
    if (id.includes('cuffe-parade')) return [7, 0, 14];
    if (id.includes('mantralaya')) return [12, 0, 9];

    if (id.includes('worli-world-one')) return [3, 0, 2]; // 285m supertall
    if (id.includes('worli-sky-vistas') || id.includes('lodha-grandeur')) return [5, 0, 4];
    if (id.includes('lower-parel-palais')) return [2, 0, 5]; // 320m supertall
    if (id.includes('lower-parel-peninsula')) return [4, 0, -1];

    if (id.includes('andheri-seepz')) return [-2, 0, -12];
    if (id.includes('andheri-nesco')) return [-6, 0, -15];
    if (id.includes('powai-solitaire')) return [8, 0, -10];
    if (id.includes('csmia-t2')) return [-1, 0, -8];

    return [0, 0, 0];
  }, [building.id]);

  // Scaled height relative to actual meters
  const totalHeight = (building.roofHeightM / 18.0) * Math.min(1.0, scrubberFloor / Math.min(building.numFloors, 25));
  const isSuperTall = building.roofHeightM > 200;

  // Architectural color palette
  const facadeColor = useMemo(() => {
    if (isSelected) return '#38bdf8'; // Glowing Sky Blue
    if (hovered) return '#60a5fa';
    if (isSuperTall) return '#1e3a8a'; // Deep Indigo glass for supertalls
    if (building.id.includes('bkc')) return '#0f766e'; // Emerald-teal glass
    if (building.id.includes('nariman')) return '#334155'; // Classic slate
    return '#1e293b';
  }, [isSelected, hovered, isSuperTall, building.id]);

  // Temporal Scale modifier (e.g. fewer floors in the past)
  const isBKC = building.id.includes('bkc-fintech');
  
  let temporalScale = 1.0;
  if (isBKC && temporalYear < 2024) temporalScale = 0.6; // Smaller footprint/height in the past
  
  const scaledHeight = totalHeight * temporalScale;
  const scaledWaterHeight = (floodSimulation.waterLevelM / 18.0);
  const isFlooded = floodSimulation.active && scaledWaterHeight > 0;

  return (
    <group position={[pos[0], scaledHeight / 2, pos[2]]}>
      {/* Flood Affected Red Base */}
      {isFlooded && (
        <mesh position={[0, -scaledHeight / 2 + scaledWaterHeight / 2, 0]}>
          <boxGeometry args={[2.85 * temporalScale, scaledWaterHeight, 2.45 * temporalScale]} />
          <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.6} transparent opacity={0.8} />
        </mesh>
      )}

      {/* 3D Tower Box */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(building);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[2.8 * temporalScale, scaledHeight, 2.4 * temporalScale]} />
        <meshStandardMaterial
          color={facadeColor}
          metalness={0.6}
          roughness={0.25}
          transparent
          opacity={0.9}
          emissive={isSelected ? '#0369a1' : (hovered ? '#1d4ed8' : (isSuperTall ? '#172554' : '#000000'))}
          emissiveIntensity={isSelected ? 0.8 : (hovered ? 0.5 : (isSuperTall ? 0.3 : 0))}
        />
      </mesh>

      {/* Wireframe Architectural Edges */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(2.8 * temporalScale, scaledHeight, 2.4 * temporalScale)]} />
        <lineBasicMaterial color={isSelected ? '#ffffff' : '#0284c7'} linewidth={1} transparent opacity={0.6} />
      </lineSegments>

      {/* Rooftop Spire / Heli-deck for Supertalls */}
      {isSuperTall && (
        <mesh position={[0, scaledHeight / 2 + 0.8, 0]}>
          <cylinderGeometry args={[0.05, 0.2, 1.6, 8]} />
          <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.8} />
        </mesh>
      )}

      {/* 3D Floating Tag */}
      {(isSelected || hovered) && (
        <Html position={[0, totalHeight / 2 + 1.2, 0]} center distanceFactor={28}>
          <div className={`px-2.5 py-1 rounded-lg shadow-2xl text-[10px] font-mono whitespace-nowrap pointer-events-none backdrop-blur-md border ${
            isSelected 
              ? 'bg-brand-primary text-white border-white/40 font-bold shadow-neon-cyan' 
              : 'bg-surface-100/95 text-slate-100 border-white/20'
          }`}>
            <div className="font-bold flex items-center gap-1">
              <Building2 className="w-3 h-3 text-cyan-300" />
              {building.name}
            </div>
            <div className="text-[9px] text-slate-300">
              {building.roofHeightM}m &bull; {building.numFloors} Floors &bull; {building.address.split(',')[1]?.trim() || 'Mumbai'}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

const UndergroundPipe: React.FC<{
  asset: UndergroundAsset;
  isSelected: boolean;
  onSelect: (a: UndergroundAsset) => void;
}> = ({ asset, isSelected, onSelect }) => {
  const [hovered, setHovered] = useState(false);

  const color = useMemo(() => {
    switch (asset.assetType) {
      case 'WATER_SUPPLY': return '#06b6d4'; // Cyan
      case 'SEWER_DRAIN': return '#f97316';  // Orange
      case 'POWER_HV': return '#eab308';     // Yellow
      case 'TELECOM_FIBER': return '#ec4899'; // Pink
      case 'GAS_PIPELINE': return '#14b8a6'; // Teal
      case 'METRO_TUNNEL': return '#a855f7'; // Purple
      default: return '#64748b';
    }
  }, [asset.assetType]);

  const isMetro = asset.assetType === 'METRO_TUNNEL';
  const radius = isMetro ? 0.65 : (asset.diameterMm > 800 ? 0.28 : 0.14);
  const depth = asset.depthMinM * 0.35;

  // Render alignment
  const coords = asset.coordinates3D.coordinates;

  return (
    <group position={[0, depth, 0]}>
      <mesh
        rotation={[0, 0, Math.PI / 2]}
        position={[0, 0, isMetro ? (asset.id.includes('coastal') ? 11 : 0) : (asset.id.includes('water') ? -3 : 3)]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(asset);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
      >
        <cylinderGeometry args={[radius, radius, 34, 24]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 1.0 : (hovered ? 0.7 : 0.35)}
          roughness={0.2}
          metalness={0.3}
          transparent
          opacity={0.88}
        />
      </mesh>

      {(isSelected || hovered) && (
        <Html position={[0, 0.6, 0]} center distanceFactor={22}>
          <div className="px-2 py-1 rounded bg-surface-100/95 text-[9px] font-mono text-white border border-white/20 shadow-xl whitespace-nowrap">
            {asset.assetType} &bull; Depth [{asset.depthMinM}m to {asset.depthMaxM}m] &bull; {asset.owningAgency.split('(')[0]}
          </div>
        </Html>
      )}
    </group>
  );
};

export const City3DMap: React.FC = () => {
  const { 
    layers, 
    scrubber, 
    selectedBuilding, 
    setSelectedBuilding, 
    selectedUnderground,
    setSelectedUnderground,
    selectedRegion,
    setSelectedRegion,
    setActiveTab,
    currentRole,
    temporalYear,
    floodSimulation
  } = useAppStore();

  const regions: Array<{ key: MumbaiRegionKey; label: string; coords: [number, number, number] }> = [
    { key: 'ALL', label: 'All Mumbai Skyline', coords: [24, 22, 28] },
    { key: 'BKC', label: 'Bandra Kurla Complex (BKC)', coords: [-6, 12, 6] },
    { key: 'WORLI', label: 'Worli & Lower Parel (Midtown)', coords: [8, 16, 12] },
    { key: 'NARIMAN', label: 'Nariman Point & Marine Drive', coords: [16, 14, 18] },
    { key: 'ANDHERI', label: 'Andheri East & Airport T2', coords: [-4, 15, -12] },
    { key: 'POWAI', label: 'Powai Tech Corridor', coords: [10, 14, -8] },
  ];

  return (
    <div className="relative w-full h-full min-h-[580px] bg-gradient-to-b from-[#020617] via-[#090d16] to-[#0f172a] rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col">
      {/* 3D Canvas Viewport */}
      <div className="flex-1 w-full h-full relative">
        <Canvas
          shadows
          camera={{ position: [24, 20, 26], fov: 45 }}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        >
          <ambientLight intensity={0.65} />
          <directionalLight position={[30, 45, 30]} intensity={1.6} castShadow />
          <pointLight position={[-20, 20, -20]} intensity={0.7} color="#0ea5e9" />
          <pointLight position={[20, 15, 20]} intensity={0.5} color="#10b981" />

          {/* Transparent Surface Ground Datum */}
          <mesh position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[52, 52]} />
            <meshStandardMaterial
              color="#090d16"
              transparent
              opacity={layers.underground ? 0.4 : 0.92}
              roughness={0.85}
            />
          </mesh>

          {/* Flood Water Plane */}
          {floodSimulation.active && floodSimulation.waterLevelM > 0 && (
            <mesh position={[0, floodSimulation.waterLevelM / 18.0, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[52, 52]} />
              <meshStandardMaterial
                color="#0ea5e9"
                transparent
                opacity={0.3}
                roughness={0.1}
                metalness={0.4}
              />
            </mesh>
          )}

          {/* Mumbai Cadastral Survey Grid Lines */}
          <gridHelper args={[52, 52, '#0ea5e9', '#1e293b']} position={[0, 0.01, 0]} />

          {/* 3D Mumbai Buildings */}
          {layers.buildings && SAMPLE_BUILDINGS
            .filter(bldg => {
              if (bldg.id.includes('andheri-nesco') && temporalYear < 2024) return false;
              return true;
            })
            .map(bldg => (
            <Building3D
              key={bldg.id}
              building={bldg}
              isSelected={selectedBuilding?.id === bldg.id}
              onSelect={(b) => setSelectedBuilding(b)}
              scrubberFloor={scrubber.currentFloor}
              temporalYear={temporalYear}
              floodSimulation={floodSimulation}
            />
          ))}

          {/* Underground Infrastructure - Filtered by Role */}
          {layers.underground && SAMPLE_UNDERGROUND_ASSETS
            .filter(asset => !asset.visibleTo || asset.visibleTo.includes(currentRole))
            .map(asset => (
            <UndergroundPipe
              key={asset.id}
              asset={asset}
              isSelected={selectedUnderground?.id === asset.id}
              onSelect={(a) => setSelectedUnderground(a)}
            />
          ))}

          <OrbitControls 
            enableDamping 
            dampingFactor={0.05} 
            maxPolarAngle={Math.PI / 2 + 0.32} 
            minDistance={8} 
            maxDistance={70} 
          />
        </Canvas>

        {/* Region Quick-Jump HUD (Top-Left) */}
        <div className="absolute top-4 left-4 glass-panel rounded-xl p-3 border border-white/10 max-w-sm pointer-events-auto space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white leading-tight">
                Mumbai Metropolitan Cadastral Map
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">
                {SAMPLE_BUILDINGS.length} Buildings &bull; {SAMPLE_PARCELS.length} Parcels &bull; 6 Wards
              </p>
            </div>
          </div>

          {/* Region Buttons */}
          <div className="grid grid-cols-2 gap-1 pt-1">
            {regions.map((r) => (
              <button
                key={r.key}
                onClick={() => setSelectedRegion(r.key)}
                className={`px-2 py-1 text-[10px] font-medium rounded text-left truncate transition-all ${
                  selectedRegion === r.key
                    ? 'bg-brand-primary text-white font-bold shadow'
                    : 'bg-surface-100 hover:bg-surface-200 text-slate-300 border border-white/5'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Legend for Subterranean Infrastructure (Bottom-Right) */}
        {layers.underground && (
          <div className="absolute bottom-4 right-4 glass-panel rounded-xl p-3 border border-white/10 space-y-1.5 text-[10px] pointer-events-auto shadow-2xl">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Cable className="w-3.5 h-3.5 text-amber-400" />
              Subterranean Utilities & Metro Corridors
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono">
              <span className="flex items-center gap-1 text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" /> Vaitarna Water (-2.2m)
              </span>
              <span className="flex items-center gap-1 text-orange-300">
                <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> SWM Sewer (-3.8m)
              </span>
              <span className="flex items-center gap-1 text-yellow-300">
                <span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" /> Tata Power 220kV (-2.8m)
              </span>
              <span className="flex items-center gap-1 text-purple-300">
                <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" /> Metro 3 Aqua (-21.4m)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
