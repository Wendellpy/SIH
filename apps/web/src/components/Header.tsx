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

// Known Mumbai buildings with coordinates for instant search results
const KNOWN_BUILDINGS_GEO: Record<string, { name: string; lat: number; lng: number; floors: number; type: string; area: string }> = {
  'ashoka towers': { name: 'Ashoka Towers', lat: 19.0054, lng: 72.8184, floors: 42, type: 'Residential', area: 'Worli' },
  'world one': { name: 'World One Tower', lat: 19.0123, lng: 72.8151, floors: 117, type: 'Residential', area: 'Upper Worli' },
  'palais royale': { name: 'Palais Royale', lat: 19.0069, lng: 72.8168, floors: 88, type: 'Residential', area: 'Worli Sea Face' },
  'one bkc': { name: 'One BKC', lat: 19.0607, lng: 72.8656, floors: 53, type: 'Commercial', area: 'BKC' },
  'maker maxity': { name: 'Maker Maxity', lat: 19.0633, lng: 72.8688, floors: 33, type: 'Commercial', area: 'BKC' },
  'platina': { name: 'Platina (IL&FS Financial Centre)', lat: 19.0642, lng: 72.8670, floors: 27, type: 'Commercial', area: 'BKC' },
  'air india building': { name: 'Air India Building', lat: 18.9257, lng: 72.8242, floors: 23, type: 'Commercial', area: 'Nariman Point' },
  'express towers': { name: 'Express Towers', lat: 18.9261, lng: 72.8225, floors: 28, type: 'Commercial', area: 'Nariman Point' },
  'trident hotel': { name: 'Trident Nariman Point', lat: 18.9270, lng: 72.8213, floors: 35, type: 'Commercial', area: 'Nariman Point' },
  'phoenix marketcity': { name: 'Phoenix Marketcity', lat: 19.0863, lng: 72.8898, floors: 8, type: 'Commercial', area: 'Kurla West' },
  'kohinoor square': { name: 'Kohinoor Square', lat: 19.0190, lng: 72.8432, floors: 52, type: 'Mixed', area: 'Dadar TT' },
  'imperial towers': { name: 'Imperial Towers', lat: 18.9900, lng: 72.8120, floors: 60, type: 'Residential', area: 'Tardeo' },
  'antilia': { name: 'Antilia', lat: 18.9740, lng: 72.8099, floors: 27, type: 'Residential', area: 'Altamount Road' },
  'peninsula business park': { name: 'Peninsula Business Park', lat: 19.0010, lng: 72.8300, floors: 19, type: 'Commercial', area: 'Lower Parel' },
  'lodha the park': { name: 'Lodha The Park', lat: 19.0108, lng: 72.8162, floors: 75, type: 'Residential', area: 'Worli' },
  'taj mahal palace': { name: 'Taj Mahal Palace', lat: 18.9217, lng: 72.8332, floors: 7, type: 'Commercial', area: 'Colaba' },
  'gateway of india': { name: 'Gateway of India', lat: 18.9220, lng: 72.8347, floors: 1, type: 'Institutional', area: 'Colaba' },
  'bandra worli sea link': { name: 'Bandra–Worli Sea Link', lat: 19.0358, lng: 72.8155, floors: 0, type: 'Infrastructure', area: 'Bandra-Worli' },
  'chhatrapati shivaji terminus': { name: 'Chhatrapati Shivaji Maharaj Terminus', lat: 18.9398, lng: 72.8355, floors: 3, type: 'Institutional', area: 'Fort' },
  'bmc headquarters': { name: 'BMC Headquarters', lat: 18.9392, lng: 72.8351, floors: 4, type: 'Government', area: 'Fort' },
  'bombay stock exchange': { name: 'Bombay Stock Exchange', lat: 18.9289, lng: 72.8326, floors: 29, type: 'Commercial', area: 'Dalal Street' },
  'oberoi sky city': { name: 'Oberoi Sky City', lat: 19.2220, lng: 72.8632, floors: 42, type: 'Residential', area: 'Borivali East' },
  'hiranandani gardens': { name: 'Hiranandani Gardens', lat: 19.1166, lng: 72.9080, floors: 20, type: 'Residential', area: 'Powai' },
  'inorbit mall': { name: 'Inorbit Mall', lat: 19.1366, lng: 72.8288, floors: 4, type: 'Commercial', area: 'Malad West' },
  'growels': { name: 'Growels 101 Mall', lat: 19.2029, lng: 72.8600, floors: 5, type: 'Commercial', area: 'Kandivali East' },
};


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
  const [geocodedResults, setGeocodedResults] = useState<Array<{ name: string; lat: number; lng: number; type: string; address: string }>>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [apiResults, setApiResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const geocodeTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Nominatim geocoding for building name search
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 3) { setGeocodedResults([]); return; }
    // Skip if it looks like a ULPIN code
    if (/^MH/i.test(q) || /^\d{14}/.test(q)) { setGeocodedResults([]); return; }

    if (geocodeTimer.current) clearTimeout(geocodeTimer.current);
    geocodeTimer.current = setTimeout(async () => {
      setIsGeocoding(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q + ', Mumbai, Maharashtra')}&format=json&limit=5&addressdetails=1&countrycodes=in`;
        const res = await fetch(url, { headers: { 'User-Agent': 'SIH-GeoElevate/1.0' } });
        const data = await res.json();
        const results = data
          .filter((r: any) => r.lat && r.lon)
          .map((r: any) => ({
            name: r.display_name?.split(',')[0] || q,
            lat: parseFloat(r.lat),
            lng: parseFloat(r.lon),
            type: r.type || r.class || 'place',
            address: r.display_name || ''
          }));
        setGeocodedResults(results);
      } catch {
        setGeocodedResults([]);
      } finally {
        setIsGeocoding(false);
      }
    }, 400);

    return () => { if (geocodeTimer.current) clearTimeout(geocodeTimer.current); };
  }, [searchQuery]);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setApiResults([]);
      return;
    }
    
    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      fetch(`/api/v1/search?q=${encodeURIComponent(q)}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success' && data.data) {
            setApiResults(data.data.slice(0, 8).map((r: any) => ({ ...r, raw: r.metadata })));
          } else {
            setApiResults([]);
          }
        })
        .catch(err => {
          console.error('Search API failed', err);
          setApiResults([]);
        })
        .finally(() => setIsSearching(false));
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const getResults = () => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const combinedResults: Array<any> = [...apiResults];

    // Decode ULPIN direct search
    if (q.startsWith('mh1') && q.length >= 14) {
      const cleanUlpin = q.toUpperCase().split('.')[0];
      const latStr = cleanUlpin.substring(3, 8);
      const lngStr = cleanUlpin.substring(8, 14);
      
      const lat = parseInt(latStr, 36) / 1000000;
      const lng = parseInt(lngStr, 36) / 1000000;
      
      console.log('[ULPIN Search] query:', q);
      console.log('[ULPIN Search] cleanUlpin:', cleanUlpin, 'len:', cleanUlpin.length);
      console.log('[ULPIN Search] latStr:', latStr, 'lngStr:', lngStr);
      console.log('[ULPIN Search] decoded lat:', lat, 'lng:', lng);
      
      // Validate coordinates are within India bounds (roughly)
      const isValidCoords = !isNaN(lat) && !isNaN(lng) && lat > 8 && lat < 37 && lng > 68 && lng < 98;
      console.log('[ULPIN Search] valid coords:', isValidCoords);
      
      if (isValidCoords) {
        combinedResults.unshift({
          type: 'GEOCODED',
          title: `3D ULPIN Match`,
          subtitle: `Location encoded in ${cleanUlpin}`,
          raw: { lat, lng, name: `Synthesized ULPIN`, address: cleanUlpin, fullUlpin: q }
        });
      }
    }

    // 0. Known buildings with coordinates (instant, no API call)
    for (const [key, bldg] of Object.entries(KNOWN_BUILDINGS_GEO)) {
      if (key.includes(q) || bldg.name.toLowerCase().includes(q) || bldg.area.toLowerCase().includes(q)) {
        combinedResults.push({
          type: 'GEOCODED',
          title: bldg.name,
          subtitle: `${bldg.floors} Floors | ${bldg.type} | ${bldg.area}`,
          raw: { lat: bldg.lat, lng: bldg.lng, name: bldg.name, address: bldg.area }
        });
      }
    }

    // Geocoded results from Nominatim (async, with deduplication against known buildings)
    if (geocodedResults.length > 0) {
      const knownNames = new Set(combinedResults.map(r => r.title.toLowerCase()));
      geocodedResults.forEach(gr => {
        if (!knownNames.has(gr.name.toLowerCase())) {
          combinedResults.push({
            type: 'GEOCODED',
            title: gr.name,
            subtitle: gr.address.length > 60 ? gr.address.substring(0, 60) + '…' : gr.address,
            raw: gr
          });
        }
      });
    }

    return combinedResults.slice(0, 8);
  };

  const results = getResults();

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
    } else if (result.type === 'GEOCODED') {
      // Fly to geocoded building location
      const { lat, lng, fullUlpin } = result.raw;
      
      console.log('[GEOCODED Select] lat:', lat, 'lng:', lng, 'fullUlpin:', fullUlpin);
      
      if (fullUlpin) {
        useAppStore.getState().setSearchedUlpin3D(fullUlpin.toUpperCase());
      }
      
      setFlyToTarget({ lng, lat, zoom: 18.5, pitch: 65 });
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

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const r = getResults();
    if (r.length > 0) {
      handleSelectResult(r[0]);
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const r = getResults();
                    console.log('[Search Enter] results:', r.length, r[0]?.type, r[0]?.raw?.lat, r[0]?.raw?.lng);
                    if (r.length > 0) handleSelectResult(r[0]);
                  }
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder="Search building name, ULPIN, owner, address..."
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
            {isSearching || isGeocoding ? (
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
                          res.type === 'GEOCODED' ? 'bg-violet-500/20 text-violet-300' :
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
