'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  Search, 
  Layers, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  Compass, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  UserCheck,
  Map as MapIcon,
  Box
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { SAMPLE_PARCELS, SAMPLE_BUILDINGS, SAMPLE_VERTICAL_UNITS, SAMPLE_UNDERGROUND_ASSETS } from '@sih/sample-data';
import { parseUlpin3D } from '@sih/shared-types';

export const Header: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    setSelectedParcel, 
    setSelectedBuilding, 
    setSelectedUnit,
    setSelectedUnderground,
    searchQuery,
    setSearchQuery,
    setFlyToTarget
  } = useAppStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [role, setRole] = useState<'CITIZEN' | 'SURVEYOR' | 'DOLR_VERIFIER' | 'ADMIN'>('DOLR_VERIFIER');
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getResults = () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const results: Array<{
      type: '3D_UNIT' | 'PARCEL' | 'BUILDING' | 'UNDERGROUND';
      title: string;
      subtitle: string;
      raw: any;
    }> = [];

    SAMPLE_VERTICAL_UNITS.forEach(u => {
      if (u.ulpin3D.toLowerCase().includes(q) || u.unitName.toLowerCase().includes(q) || u.ownerName.toLowerCase().includes(q)) {
        results.push({
          type: '3D_UNIT',
          title: u.unitName,
          subtitle: `3D ULPIN: ${u.ulpin3D} | Level: ${u.levelCode} | ${u.ownerName}`,
          raw: u
        });
      }
    });

    SAMPLE_PARCELS.forEach(p => {
      if (p.ulpin.toLowerCase().includes(q) || p.village.toLowerCase().includes(q) || p.surveyNumber.toLowerCase().includes(q)) {
        results.push({
          type: 'PARCEL',
          title: `Parcel ${p.ulpin} (${p.village})`,
          subtitle: `Survey No: ${p.surveyNumber} | Area: ${p.areaSqm} sqm`,
          raw: p
        });
      }
    });

    SAMPLE_BUILDINGS.forEach(b => {
      if (b.name.toLowerCase().includes(q) || b.address.toLowerCase().includes(q)) {
        results.push({
          type: 'BUILDING',
          title: b.name,
          subtitle: `${b.numFloors} Floors | ${b.address}`,
          raw: b
        });
      }
    });

    SAMPLE_UNDERGROUND_ASSETS.forEach(a => {
      if (a.ulpin3D.toLowerCase().includes(q) || a.assetType.toLowerCase().includes(q) || a.owningAgency.toLowerCase().includes(q)) {
        results.push({
          type: 'UNDERGROUND',
          title: `3D Utility: ${a.assetType}`,
          subtitle: `${a.ulpin3D} | Depth: ${a.depthMinM}m to ${a.depthMaxM}m`,
          raw: a
        });
      }
    });

    if (results.length === 0) {
      const parsed = parseUlpin3D(searchQuery.trim());
      if (parsed) {
        results.push({
          type: '3D_UNIT',
          title: `Simulated Unit ${parsed.unitCode}`,
          subtitle: `3D ULPIN: ${parsed.rawString} | Simulated Record`,
          raw: {
            unit: {
              id: `sim-${Date.now()}`,
              buildingId: 'simulated-building',
              parcelId: 'simulated-parcel',
              ulpin3D: parsed.rawString,
              domainCode: parsed.domainCode,
              levelCode: parsed.levelCode,
              unitCode: parsed.unitCode,
              floorNumber: parsed.levelNumber,
              unitName: `Simulated Unit ${parsed.unitCode}`,
              useType: 'Mixed',
              ownerName: 'Simulated Owner (MyBMC)',
              ownerId: 'SIM-MH-9999',
              carpetAreaSqm: 500.0,
              builtupAreaSqm: 575.0,
              volumeCum: 2000.0,
              zMin: parsed.levelNumber * 3.8,
              zMax: (parsed.levelNumber + 1) * 3.8,
              verticalDatum: 'WGS84 MSL',
              bounds: { minLng: 72.8, maxLng: 72.9, minLat: 19.0, maxLat: 19.1, minZ: 0, maxZ: 10 },
              validationStatus: 'VALID',
              provenance: 'DRONE_LIDAR',
              taxStatus: 'PAID',
              simulated: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            },
            building: {
              id: 'simulated-building',
              parcelId: 'simulated-parcel',
              name: `Simulated Building (${parsed.baseUlpin})`,
              footprint: { type: 'Polygon', coordinates: [] },
              eavesHeightM: (Math.max(4, parsed.levelNumber + 2)) * 3.8,
              roofHeightM: (Math.max(4, parsed.levelNumber + 2)) * 3.8 + 2,
              numFloors: Math.max(4, parsed.levelNumber + 2),
              numBasements: 0,
              plinthElevationM: 0,
              totalBuiltupAreaSqm: 10000,
              address: 'Simulated Address, Mumbai',
              simulated: true
            }
          }
        });
      }
    }

    return results.slice(0, 8);
  };

  const results = getResults();

  const handleSelectResult = (result: ReturnType<typeof getResults>[0]) => {
    setIsSearchOpen(false);
    setSearchQuery('');

    if (result.type === '3D_UNIT') {
      const unit = result.raw.unit || result.raw;
      const bldg = result.raw.building || SAMPLE_BUILDINGS.find(b => b.id === unit.buildingId) || null;
      const parcel = SAMPLE_PARCELS.find(p => p.id === unit.parcelId) || null;
      setSelectedUnit(unit);
      setSelectedBuilding(bldg);
      setSelectedParcel(parcel);
      
      const lng = unit.bounds?.minLng || bldg?.footprint?.coordinates?.[0]?.[0]?.[0] || 72.8280;
      const lat = unit.bounds?.minLat || bldg?.footprint?.coordinates?.[0]?.[0]?.[1] || 18.9960;
      setFlyToTarget({ lng, lat, zoom: 17.5, pitch: 60 });
      setActiveTab('MAPLIBRE_3D');
      
    } else if (result.type === 'BUILDING') {
      setSelectedBuilding(result.raw);
      const parcel = SAMPLE_PARCELS.find(p => p.id === result.raw.parcelId) || null;
      setSelectedParcel(parcel);
      
      const lng = result.raw.footprint?.coordinates?.[0]?.[0]?.[0] || 72.8280;
      const lat = result.raw.footprint?.coordinates?.[0]?.[0]?.[1] || 18.9960;
      setFlyToTarget({ lng, lat, zoom: 17, pitch: 55 });
      setActiveTab('MAPLIBRE_3D');
      
    } else if (result.type === 'PARCEL') {
      setSelectedParcel(result.raw);
      const bldg = SAMPLE_BUILDINGS.find(b => b.parcelId === result.raw.id) || null;
      setSelectedBuilding(bldg);
      
      const lng = result.raw.centroid?.[0] || 72.8280;
      const lat = result.raw.centroid?.[1] || 18.9960;
      setFlyToTarget({ lng, lat, zoom: 16.5, pitch: 45 });
      setActiveTab('MAPLIBRE_3D');
      
    } else if (result.type === 'UNDERGROUND') {
      setSelectedUnderground(result.raw);
      setActiveTab('MAP_3D');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 px-4 py-2 flex items-center justify-between shadow-lg">
      {/* Brand & Emblem */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-primary to-emerald-500 shadow-neon-cyan">
          <Building2 className="w-4 h-4 text-white" />
          <span className="absolute -bottom-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              3D ULPIN <span className="text-[10px] px-1.5 py-0.2 rounded bg-brand-primary/20 text-brand-primary border border-brand-primary/30 font-mono font-medium">DoLR #26011</span>
            </h1>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
              MBTiles 3D Vector
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            3D Cadastre & Vertical Property Mapping &bull; Mumbai Vector Engine
          </p>
        </div>
      </div>

      {/* Universal Search Bar */}
      <div className="relative flex-1 max-w-sm mx-4" ref={searchRef}>
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search 3D ULPIN (e.g. MH13BOM04521873.A+03-B302), owner, address..."
            className="w-full pl-8 pr-4 py-1 text-xs bg-surface-100/90 hover:bg-surface-200/90 focus:bg-surface-200 border border-white/10 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 text-xs text-slate-400 hover:text-white"
            >
              &times;
            </button>
          )}
        </div>

        {/* Dropdown Results */}
        {isSearchOpen && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-surface-100/95 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto">
            <div className="px-3 py-1 text-[9px] font-semibold text-slate-400 uppercase tracking-wider bg-surface-200/50 border-b border-white/5">
              Cadastral Matches ({results.length})
            </div>
            {results.map((res, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectResult(res)}
                className="w-full text-left px-3 py-1.5 hover:bg-white/5 border-b border-white/5 flex items-center justify-between group transition-colors"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[8px] px-1 py-0.2 rounded font-mono font-semibold uppercase ${
                      res.type === '3D_UNIT' ? 'bg-cyan-500/20 text-cyan-300' :
                      res.type === 'PARCEL' ? 'bg-emerald-500/20 text-emerald-300' :
                      res.type === 'BUILDING' ? 'bg-indigo-500/20 text-indigo-300' :
                      'bg-amber-500/20 text-amber-300'
                    }`}>
                      {res.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-medium text-slate-100 truncate group-hover:text-brand-primary transition-colors">
                      {res.title}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate font-mono">
                    {res.subtitle}
                  </p>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-500 group-hover:text-brand-primary transform group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-surface-100/90 p-0.5 rounded-lg border border-white/10">
          <button
            onClick={() => setActiveTab('MAPLIBRE_3D')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'MAPLIBRE_3D'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-neon-cyan'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5 text-cyan-200" />
            <span>MapLibre 3D (MBTiles)</span>
          </button>

          <button
            onClick={() => setActiveTab('EXPLODED_3D')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'EXPLODED_3D'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Exploded 3D Drill-Down
          </button>

          <button
            onClick={() => setActiveTab('MAP_3D')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'MAP_3D'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            3D Cadastral Globe
          </button>

          <button
            onClick={() => setActiveTab('AI_STUDIO')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'AI_STUDIO'
                ? 'bg-brand-primary text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            AI Studio
          </button>

          <button
            onClick={() => setActiveTab('ADMIN_PORTAL')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === 'ADMIN_PORTAL'
                ? 'bg-brand-danger text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
            DoLR Verifier
          </button>
        </div>

        {/* Role Selector */}
        <div className="flex items-center gap-1 pl-2 border-l border-white/10">
          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            className="bg-surface-100 text-slate-200 text-[11px] rounded border border-white/10 px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer font-medium"
          >
            <option value="DOLR_VERIFIER">DoLR Verifier</option>
            <option value="SURVEYOR">Surveyor</option>
            <option value="ADMIN">Admin</option>
            <option value="CITIZEN">Citizen</option>
          </select>
        </div>
      </div>
    </header>
  );
};
