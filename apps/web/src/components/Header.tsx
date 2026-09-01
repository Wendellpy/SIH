'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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
  Box,
  Loader2
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { SAMPLE_PARCELS, SAMPLE_BUILDINGS, SAMPLE_VERTICAL_UNITS, SAMPLE_UNDERGROUND_ASSETS } from '@sih/sample-data';
import { parseUlpin3D } from '@sih/shared-types';
import { BorderBeam } from '@/components/ui/border-beam-search';


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
    setSearchedParcelGeoJSON
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

  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setResults([]);
      return;
    }
    
    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      fetch(`/api/v1/search?q=${encodeURIComponent(q)}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success' && data.data) {
            // Map 'metadata' from API to 'raw' so handleSelectResult works seamlessly
            setResults(data.data.slice(0, 8).map((r: any) => ({ ...r, raw: r.metadata })));
          } else {
            setResults([]);
          }
        })
        .catch(err => {
          console.error('Search API failed', err);
          setResults([]);
        })
        .finally(() => setIsSearching(false));
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSelectResult = (result: any) => {
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
      
    } else if (result.type === 'LOCATION') {
      // Clear selections so it doesn't try to highlight a fake building
      setSelectedBuilding(null);
      setSelectedParcel(null);
      setSelectedUnit(null);
      
      const lng = parseFloat(result.raw.lon);
      const lat = parseFloat(result.raw.lat);
      
      if (result.raw.feature) {
        setSearchedParcelGeoJSON(result.raw.feature);
      }
      
      setFlyToTarget({ lng, lat, zoom: 17, pitch: 45 });
      setActiveTab('MAPLIBRE_3D');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 px-6 py-1.5 flex items-center justify-between shadow-sm" suppressHydrationWarning>
      {/* Brand & Emblem */}
      <Link href="/" className="flex items-center gap-3 flex-shrink-0 hover:opacity-90 transition-opacity">
        <img src="/logo.png" alt="GeoElevate 3D Vector Map" className="h-12 w-auto object-contain" />
      </Link>

      {/* Universal Search Bar */}
      <div className="relative flex-1 max-w-xl mx-auto" ref={searchRef} suppressHydrationWarning>
        <div className="w-full relative group" suppressHydrationWarning>
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
        {isSearchOpen && (searchQuery.trim().length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto animate-in slide-in-from-top-2 duration-200">
            {isSearching ? (
              <div className="p-4 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-brand-primary" />
                Searching cadastre...
              </div>
            ) : results.length > 0 ? (
              <>
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
                          res.type === 'LOCATION' ? 'bg-purple-500/20 text-purple-300' :
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
              </>
            ) : (
              <div className="p-4 text-center text-slate-400 text-xs flex flex-col items-center gap-1">
                <AlertTriangle className="w-5 h-5 text-slate-500 mb-1" />
                <span>No cadastral records found.</span>
                <span className="text-[10px] text-slate-500">Try searching by 3D ULPIN, owner name, or village.</span>
              </div>
            )}
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
            onClick={() => {
              setActiveTab('MINING');
              setFlyToTarget({ lng: 80.0, lat: 22.0, zoom: 4.5, pitch: 0 }); // India-wide default
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
              activeTab === 'MINING' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            Mining
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


      </div>
    </header>
  );
};
