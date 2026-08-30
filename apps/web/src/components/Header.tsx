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
  User,
  Map as MapIcon,
  Box
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { SAMPLE_PARCELS, SAMPLE_BUILDINGS, SAMPLE_VERTICAL_UNITS, SAMPLE_UNDERGROUND_ASSETS } from '@sih/sample-data';
import { parseUlpin3D } from '@sih/shared-types';
import { BorderBeam } from '@/components/ui/border-beam-search';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { HardHat, Bolt } from 'lucide-react';

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
    setFlyToTarget,
    currentRole,
    setCurrentRole
  } = useAppStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
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
        let baseLng = 72.8280;
        let baseLat = 18.9960;
        let address = 'Simulated Address, Mumbai';

        const matchingParcel = SAMPLE_PARCELS.find(p => p.ulpin === parsed.baseUlpin);
        if (matchingParcel) {
          baseLng = matchingParcel.centroid[0];
          baseLat = matchingParcel.centroid[1];
          address = `${matchingParcel.village}, ${matchingParcel.tehsil}, ${matchingParcel.district}`;
        } else if (parsed.baseUlpin.startsWith('MH1') && parsed.baseUlpin.length === 14) {
          // Geospatially decode the Base36 embedded coordinates
          const latStr = parsed.baseUlpin.substring(3, 8).toLowerCase();
          const lngStr = parsed.baseUlpin.substring(8, 14).toLowerCase();
          const parsedLat = parseInt(latStr, 36) / 1000000;
          const parsedLng = parseInt(lngStr, 36) / 1000000;
          
          if (!isNaN(parsedLat) && !isNaN(parsedLng)) {
            baseLat = parsedLat;
            baseLng = parsedLng;
            address = `Decoded Coordinate (${baseLat.toFixed(4)}, ${baseLng.toFixed(4)})`;
          } else {
            // Fallback deterministic hash if malformed
            let hash = 0;
            for (let i = 0; i < parsed.baseUlpin.length; i++) {
              hash = parsed.baseUlpin.charCodeAt(i) + ((hash << 5) - hash);
            }
            baseLng = 72.80 + (Math.abs(Math.sin(hash)) * 10000 % 1) * 0.15;
            baseLat = 18.90 + (Math.abs(Math.cos(hash)) * 10000 % 1) * 0.35;
            address = `Extrapolated Location from ULPIN, Mumbai`;
          }
        } else {
          // Hackathon Mockup: Deterministically pseudo-decode unknown ULPINs to a coordinate in Mumbai
          let hash = 0;
          for (let i = 0; i < parsed.baseUlpin.length; i++) {
            hash = parsed.baseUlpin.charCodeAt(i) + ((hash << 5) - hash);
          }
          const randLng = Math.abs(Math.sin(hash)) * 10000 % 1;
          const randLat = Math.abs(Math.cos(hash)) * 10000 % 1;
          
          baseLng = 72.80 + randLng * (72.95 - 72.80);
          baseLat = 18.90 + randLat * (19.25 - 18.90);
          address = `Extrapolated Location from ULPIN, Mumbai`;
        }

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
              bounds: { minLng: baseLng, maxLng: baseLng + 0.0002, minLat: baseLat, maxLat: baseLat + 0.0002, minZ: 0, maxZ: 10 },
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
              footprint: { 
                type: 'Polygon', 
                coordinates: [[[baseLng, baseLat], [baseLng + 0.0002, baseLat], [baseLng + 0.0002, baseLat + 0.0002], [baseLng, baseLat + 0.0002], [baseLng, baseLat]]] 
              },
              eavesHeightM: (Math.max(4, parsed.levelNumber + 2)) * 3.8,
              roofHeightM: (Math.max(4, parsed.levelNumber + 2)) * 3.8 + 2,
              numFloors: Math.max(4, parsed.levelNumber + 2),
              numBasements: 0,
              plinthElevationM: 0,
              totalBuiltupAreaSqm: 10000,
              address: address,
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
      setActiveTab('MAPLIBRE_3D');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 px-6 py-1.5 flex items-center justify-between shadow-sm">
      {/* Brand & Emblem */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <img src="/logo.png" alt="GeoElevate 3D Vector Map" className="h-12 w-auto object-contain" />
      </div>

      {/* Universal Search Bar */}
      <div className="relative flex-1 max-w-xl mx-auto" ref={searchRef}>
        <div className="w-full relative group">
          <BorderBeam size="md" colorVariant="ocean" duration={3.1} borderRadius={9999}>
            <div className="w-full h-10 bg-black/40 border border-white/10 shadow-inner flex items-center px-4 gap-2 rounded-full relative z-10 backdrop-blur-md">
              <Search className="w-4 h-4 text-slate-400 group-focus-within:text-brand-primary transition-colors pointer-events-none shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search 3D ULPIN, owner, address..."
                className="w-full bg-transparent text-[14px] text-slate-200 placeholder-slate-500 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-lg text-slate-400 hover:text-white shrink-0 ml-1"
                >
                  &times;
                </button>
              )}
            </div>
          </BorderBeam>
        </div>

        {/* Dropdown Results */}
        {isSearchOpen && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
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

      {/* Navigation Tabs & Profile */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <nav className="flex items-center gap-1 bg-black/20 p-1 rounded-lg border border-white/5">
          <button
            onClick={() => setActiveTab('MAPLIBRE_3D')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
              activeTab === 'MAPLIBRE_3D' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            Vector Map
          </button>

          <button
            onClick={() => setActiveTab('EXPLODED_3D')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
              activeTab === 'EXPLODED_3D' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Exploded View
          </button>


          <button
            onClick={() => setActiveTab('MAHARASHTRA')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
              activeTab === 'MAHARASHTRA' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Maharashtra
          </button>

          <button
            onClick={() => setActiveTab('ADMIN_PORTAL')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
              activeTab === 'ADMIN_PORTAL' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Admin
          </button>
        </nav>

        {/* Role Selector */}
        <div className="flex items-center gap-2 pl-4 border-l border-white/10">
          <DropdownMenu
            align="right"
            options={[
              {
                label: "Revenue Dept",
                onClick: () => setCurrentRole('revenue'),
                Icon: <ShieldCheck className="h-4 w-4 text-brand-primary" />,
              },
              {
                label: "City Engineer",
                onClick: () => setCurrentRole('engineer'),
                Icon: <HardHat className="h-4 w-4 text-amber-400" />,
              },
              {
                label: "Utility Agency",
                onClick: () => setCurrentRole('utility'),
                Icon: <Bolt className="h-4 w-4 text-blue-400" />,
              },
            ]}
          >
            <div className="flex items-center gap-2 text-xs">
              {currentRole === 'revenue' && <ShieldCheck className="h-4 w-4 text-brand-primary" />}
              {currentRole === 'engineer' && <HardHat className="h-4 w-4 text-amber-400" />}
              {currentRole === 'utility' && <Bolt className="h-4 w-4 text-blue-400" />}
              <span className="font-semibold text-white">
                {currentRole === 'revenue' ? 'Revenue Dept' : currentRole === 'engineer' ? 'City Engineer' : 'Utility Agency'}
              </span>
            </div>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
