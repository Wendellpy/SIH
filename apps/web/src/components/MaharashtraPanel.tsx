'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Compass, Search, Loader2, ChevronDown, Check, MapPin } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { parseUlpin3D } from '@sih/shared-types';

/* ─── Custom Glassmorphism Select ─── */
interface SelectOption { id: string; name: string }
const CustomSelect: React.FC<{
  options: SelectOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}> = ({ options, value, onChange, placeholder, disabled, loading, icon }) => {
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

  const selectedLabel = options.find(o => o.id === value)?.name;
  const filtered = options.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => { setOpen(o => !o); setSearch(''); }}
        className={`
          w-full flex items-center justify-between gap-2 px-4 py-3 rounded-xl text-sm font-medium
          bg-black/40 border backdrop-blur-md transition-all
          ${open ? 'border-cyan-500/50 ring-1 ring-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]' : 'border-white/10 hover:border-white/20'}
          ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span className="flex items-center gap-2 truncate">
          {icon}
          {loading ? (
            <span className="flex items-center gap-2 text-slate-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading...
            </span>
          ) : selectedLabel ? (
            <span className="text-slate-100">{selectedLabel}</span>
          ) : (
            <span className="text-slate-500">{placeholder}</span>
          )}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-2 w-full bg-[#0f1219] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Search */}
          <div className="p-2 border-b border-white/5">
            <div className="flex items-center gap-2 px-3 py-2 bg-black/40 rounded-lg border border-white/5">
              <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
              />
            </div>
          </div>
          {/* Options */}
          <div className="max-h-60 overflow-y-auto py-1" style={{ willChange: 'transform' }}>
            {filtered.length === 0 ? (
              <div className="px-4 py-3 text-xs text-slate-500 text-center">No results found</div>
            ) : (
              filtered.map(o => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => { onChange(o.id); setOpen(false); }}
                  className={`
                    w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors
                    ${o.id === value
                      ? 'bg-cyan-500/10 text-cyan-300'
                      : 'text-slate-300 hover:bg-white/5 hover:text-slate-100'
                    }
                  `}
                >
                  <span className="truncate">{o.name}</span>
                  {o.id === value && <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Main Panel ─── */
export const MaharashtraPanel = () => {
  const [districts, setDistricts] = useState<any[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [talukas, setTalukas] = useState<any[]>([]);
  const [selectedTaluka, setSelectedTaluka] = useState('');
  const [villages, setVillages] = useState<any[]>([]);
  const [selectedVillage, setSelectedVillage] = useState('');
  const [searchVal, setSearchVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  
  // Loading states
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingTalukas, setLoadingTalukas] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);
  const [dataSource, setDataSource] = useState<string>('');

  const { setActiveTab, setSearchQuery, setFlyToTarget, setSearchedParcelGeoJSON } = useAppStore();

  const handleFocusMap = () => {
    if (!result || !result.geometry) return;
    
    setSearchedParcelGeoJSON(result.geometry);
    
    // Find a simple centroid from the first polygon ring to fly to
    let lng = 0, lat = 0, count = 0;
    try {
      let coords = result.geometry.geometry.coordinates;
      while (coords.length > 0 && Array.isArray(coords[0]) && Array.isArray(coords[0][0])) {
        coords = coords[0];
      }
      
      for (const pt of coords) {
        lng += pt[0];
        lat += pt[1];
        count++;
      }
      lng /= count;
      lat /= count;
      
      setFlyToTarget({ lng, lat, zoom: 17, pitch: 45 });
      setActiveTab('MAPLIBRE_3D');
    } catch(e) {
      console.warn("Could not parse geometry centroid for flyTo");
    }
  };

  const handleDataSourceInfo = (data: any) => {
    if (data.source === 'mock') {
      setDataSource('Mock Data — Development Only');
    } else if (data.cached && data.stale) {
      setDataSource('Maharashtra Government — Stale Cache');
    } else if (data.cached) {
      setDataSource('Maharashtra Government — Cached');
    } else if (data.source === 'maharashtra-government') {
      setDataSource('Maharashtra Government');
    }
  };

  const loadDistricts = (refresh = false) => {
    setApiError(null);
    setLoadingDistricts(true);
    if (refresh) {
      fetch('http://127.0.0.1:4000/api/v1/maharashtra/cache/refresh', { method: 'POST', body: JSON.stringify({ scope: 'districts' }), headers: { 'Content-Type': 'application/json' } })
        .then(() => fetchDistricts())
        .catch(() => setApiError('Unable to refresh Maharashtra government data.'));
    } else {
      fetchDistricts();
    }
  };

  const fetchDistricts = () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    fetch('http://127.0.0.1:4000/api/v1/maharashtra/districts', { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        clearTimeout(timeoutId);
        if (data.success) {
          setDistricts(data.data || []);
          handleDataSourceInfo(data);
          setApiError(null);
        } else {
          setApiError(data.error?.message || 'Upstream service unavailable');
        }
      })
      .catch(err => {
        clearTimeout(timeoutId);
        console.error('[Maharashtra] District fetch error:', err);
        // Retry once after 2 seconds
        setTimeout(() => {
          fetch('http://127.0.0.1:4000/api/v1/maharashtra/districts')
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                setDistricts(data.data || []);
                handleDataSourceInfo(data);
                setApiError(null);
              }
            })
            .catch(() => setApiError('Network Error: Backend not responding. Check that the API server is running on port 4000.'));
        }, 2000);
      })
      .finally(() => setLoadingDistricts(false));
  };

  useEffect(() => {
    loadDistricts();
  }, []);

  useEffect(() => {
    setSelectedTaluka('');
    setTalukas([]);
    setSelectedVillage('');
    setVillages([]);
    if (!selectedDistrict) return;
    setLoadingTalukas(true);
    fetch(`http://127.0.0.1:4000/api/v1/maharashtra/talukas/${selectedDistrict}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTalukas(data.data || []);
          handleDataSourceInfo(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingTalukas(false));
  }, [selectedDistrict]);

  useEffect(() => {
    setSelectedVillage('');
    setVillages([]);
    if (!selectedTaluka) return;
    setLoadingVillages(true);
    fetch(`http://127.0.0.1:4000/api/v1/maharashtra/villages/${selectedTaluka}?district=${selectedDistrict}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setVillages(data.data || []);
          handleDataSourceInfo(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingVillages(false));
  }, [selectedTaluka]);

  const handleSearch = () => {
    if (!searchVal && !selectedVillage) return;
    setLoading(true);
    setResult(null);

    let url = 'http://127.0.0.1:4000/api/v1/maharashtra/parcel?';
    if (selectedDistrict) url += `district=${selectedDistrict}&`;
    if (selectedTaluka) url += `taluka=${selectedTaluka}&`;
    if (selectedVillage) url += `village=${selectedVillage}&`;
    if (searchVal) url += `cts=${encodeURIComponent(searchVal)}&`;

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setResult(data);
        handleDataSourceInfo(data);
      })
      .catch(err => setResult({ success: false, error: { message: 'Backend not responding' } }))
      .finally(() => setLoading(false));
  };

  return (
    <div className="flex flex-col h-full w-full p-6 text-slate-200 overflow-y-auto">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        <div className="flex justify-between items-end border-b border-white/10 pb-4">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Compass className="text-brand-primary" /> Maharashtra Land Records Integration
            </h2>
            {dataSource && (
              <span className={`text-xs mt-2 flex items-center gap-1 ${dataSource.includes('Mock') ? 'text-orange-400' : 'text-green-400'}`}>
                ● {dataSource}
              </span>
            )}
          </div>
          <button onClick={() => loadDistricts(true)} className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded disabled:opacity-50" disabled={loadingDistricts}>
            {loadingDistricts ? 'Refreshing...' : 'Refresh API'}
          </button>
        </div>

        {apiError && (
          <div className="p-3 bg-red-900/30 border border-red-500/30 text-red-300 text-sm rounded-lg flex items-center gap-2">
            <strong>API Error:</strong> {apiError}
          </div>
        )}

        {/* ── Custom Dropdowns ── */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-semibold mb-2 text-slate-400 uppercase tracking-wider">
              District {loadingDistricts && <Loader2 className="w-3 h-3 inline animate-spin"/>}
            </label>
            <CustomSelect
              options={districts}
              value={selectedDistrict}
              onChange={setSelectedDistrict}
              placeholder="Select District"
              disabled={loadingDistricts}
              loading={loadingDistricts}
              icon={<MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold mb-2 text-slate-400 uppercase tracking-wider">
              Taluka {loadingTalukas && <Loader2 className="w-3 h-3 inline animate-spin"/>}
            </label>
            <CustomSelect
              options={talukas}
              value={selectedTaluka}
              onChange={setSelectedTaluka}
              placeholder="Select Taluka"
              disabled={!selectedDistrict || loadingTalukas}
              loading={loadingTalukas}
              icon={<MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold mb-2 text-slate-400 uppercase tracking-wider">
              Village {loadingVillages && <Loader2 className="w-3 h-3 inline animate-spin"/>}
            </label>
            <CustomSelect
              options={villages}
              value={selectedVillage}
              onChange={setSelectedVillage}
              placeholder="Select Village"
              disabled={!selectedTaluka || loadingVillages}
              loading={loadingVillages}
              icon={<MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
            />
          </div>
        </div>

        <div className="glass-card bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-lg">
          <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-3">Search Cadastral Record</label>
          <div className="flex gap-3">
            <input 
              type="text" 
              placeholder="Enter Survey No, CTS, or ULPIN..."
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none transition-all"
            />
            <button 
              onClick={handleSearch}
              disabled={loading || !searchVal}
              className="bg-brand-primary hover:bg-cyan-400 text-white font-medium border border-cyan-400/50 text-sm px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-neon-cyan disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />}
              Search
            </button>
          </div>
        </div>

        {result && (
          <div className="glass-card bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mt-4 text-sm shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Compass className="w-32 h-32 text-brand-primary" />
            </div>
            <h3 className="font-semibold text-slate-100 border-b border-white/10 pb-3 mb-4 flex items-center gap-2 relative z-10">
              {result.success ? 'Cadastral Parcel Record' : 'Record Not Found'}
            </h3>
            
            {result.success && result.parcel && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-[13px] relative z-10 mb-6">
                  <div><span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-0.5">District</span> <span className="text-slate-200 font-medium">{result.parcel.district?.name || '-'}</span></div>
                  <div><span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-0.5">Taluka</span> <span className="text-slate-200 font-medium">{result.parcel.taluka?.name || '-'}</span></div>
                  <div><span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-0.5">Village</span> <span className="text-slate-200 font-medium">{result.parcel.village?.name || '-'}</span></div>
                  <div><span className="text-slate-500 block text-[10px] uppercase tracking-wider mb-0.5">Survey No / CTS</span> <span className="text-cyan-300 font-mono font-medium">{result.parcel.surveyNumber || '-'}</span></div>
                </div>
                
                <div className="border border-white/10 rounded-xl bg-black/40 backdrop-blur-sm p-4 relative z-10 shadow-inner">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Geometry Status</span>
                    {result.geometryStatus === 'GEOMETRY_AVAILABLE' && <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-400 border border-emerald-800">AVAILABLE</span>}
                    {result.geometryStatus === 'GEOMETRY_PENDING' && <span className="text-[10px] px-2 py-0.5 rounded bg-amber-900/50 text-amber-400 border border-amber-800">PENDING</span>}
                    {result.geometryStatus === 'GEOMETRY_NOT_FOUND' && <span className="text-[10px] px-2 py-0.5 rounded bg-red-900/50 text-red-400 border border-red-800">NOT FOUND</span>}
                    {result.geometryStatus === 'GEOMETRY_SOURCE_UNAVAILABLE' && <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">SOURCE UNAVAILABLE</span>}
                    {result.geometryStatus === 'GEOMETRY_INVALID' && <span className="text-[10px] px-2 py-0.5 rounded bg-orange-900/50 text-orange-400 border border-orange-800">INVALID FORMAT</span>}
                  </div>
                  
                  {result.geometryStatus === 'GEOMETRY_AVAILABLE' ? (
                    <div className="text-xs text-slate-300 mt-2">
                      <p className="leading-relaxed">Valid polygon retrieved from Mahabhunakasha. EPSG:4326 normalized.</p>
                      <button className="mt-3 text-[11px] font-medium bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-lg transition-all flex items-center gap-2" onClick={handleFocusMap}>
                        <Compass className="w-3.5 h-3.5" /> Focus on Map
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 mt-2">
                      <p className="leading-relaxed">No valid cadastral polygon could be automatically resolved for this parcel.</p>
                      <button className="mt-3 text-[11px] font-medium bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg transition-all" onClick={handleSearch}>Retry Geometry</button>
                    </div>
                  )}
                </div>

                <div className="border border-white/10 rounded-xl bg-black/40 backdrop-blur-sm p-4 relative z-10 shadow-inner">
                   <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-3">Provenance</span>
                   <div className="text-xs text-slate-400 grid grid-cols-2 gap-4">
                      <div><span className="text-slate-500 block">Land Records Source</span> <span className="font-mono text-indigo-300">{result.source?.landRecords || 'maharashtra-government'}</span></div>
                      <div><span className="text-slate-500 block">Geometry Source</span> <span className="font-mono text-cyan-300">{result.source?.geometry || 'unavailable'}</span></div>
                   </div>
                </div>
              </div>
            )}
            
            {!result.success && (
              <div className="text-red-400 text-xs">
                {result.error?.message || 'Failed to retrieve record.'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
