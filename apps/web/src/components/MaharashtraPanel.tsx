'use client';

import React, { useState, useEffect } from 'react';
import { Compass, Search, Loader2 } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { parseUlpin3D } from '@sih/shared-types';

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
      fetch('http://localhost:4000/api/v1/maharashtra/cache/refresh', { method: 'POST', body: JSON.stringify({ scope: 'districts' }), headers: { 'Content-Type': 'application/json' } })
        .then(() => fetchDistricts())
        .catch(() => setApiError('Unable to refresh Maharashtra government data.'));
    } else {
      fetchDistricts();
    }
  };

  const fetchDistricts = () => {
    fetch('http://localhost:4000/api/v1/maharashtra/districts')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDistricts(data.data || []);
          handleDataSourceInfo(data);
        } else {
          setApiError(data.error?.message || 'Upstream service unavailable');
        }
      })
      .catch(err => setApiError('Network Error: Backend not responding'))
      .finally(() => setLoadingDistricts(false));
  };

  useEffect(() => {
    loadDistricts();
  }, []);

  useEffect(() => {
    setSelectedTaluka('');
    setSelectedVillage('');
    setTalukas([]);
    setVillages([]);
    
    if (!selectedDistrict) return;
    setLoadingTalukas(true);
    fetch(`http://localhost:4000/api/v1/maharashtra/talukas/${selectedDistrict}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTalukas(data.data || []);
          handleDataSourceInfo(data);
        } else {
          setApiError(data.error?.message || 'Error loading talukas');
        }
      })
      .finally(() => setLoadingTalukas(false));
  }, [selectedDistrict]);

  useEffect(() => {
    setSelectedVillage('');
    setVillages([]);

    if (!selectedTaluka) return;
    setLoadingVillages(true);
    fetch(`http://localhost:4000/api/v1/maharashtra/villages/${selectedTaluka}?district=${selectedDistrict}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setVillages(data.data || []);
          handleDataSourceInfo(data);
        } else {
          setApiError(data.error?.message || 'Error loading villages');
        }
      })
      .finally(() => setLoadingVillages(false));
  }, [selectedTaluka, selectedDistrict]);

  const handleSearch = async () => {
    setLoading(true);
    setResult(null);
    try {
      // If it's a ULPIN
      if (searchVal.length >= 14) {
        const res = await fetch(`http://localhost:4000/api/v1/maharashtra/ulpin/${searchVal}`);
        const data = await res.json();
        setResult(data);
      } else {
        // Assume CTS search
        const res = await fetch(`http://localhost:4000/api/v1/maharashtra/parcel?district=${selectedDistrict}&taluka=${selectedTaluka}&village=${selectedVillage}&cts=${searchVal}`);
        setResult(await res.json());
      }
    } catch (e) {
      setResult({ success: false, error: { message: 'Network Error' } });
    } finally {
      setLoading(false);
    }
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

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-[11px] font-semibold mb-2 text-slate-400 uppercase tracking-wider">District {loadingDistricts && <Loader2 className="w-3 h-3 inline animate-spin"/>}</label>
            <select 
              value={selectedDistrict} 
              onChange={e => setSelectedDistrict(e.target.value)}
              className="w-full bg-black/40 border border-white/10 backdrop-blur-md rounded-xl p-2.5 text-sm focus:ring-1 focus:ring-brand-primary focus:outline-none transition-all"
              disabled={loadingDistricts}
            >
              <option value="">{loadingDistricts ? 'Loading districts...' : 'Select District'}</option>
              {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold mb-2 text-slate-400 uppercase tracking-wider">Taluka {loadingTalukas && <Loader2 className="w-3 h-3 inline animate-spin"/>}</label>
            <select 
              value={selectedTaluka} 
              onChange={e => setSelectedTaluka(e.target.value)}
              className="w-full bg-black/40 border border-white/10 backdrop-blur-md rounded-xl p-2.5 text-sm focus:ring-1 focus:ring-brand-primary focus:outline-none transition-all"
              disabled={!selectedDistrict || loadingTalukas}
            >
              <option value="">{loadingTalukas ? 'Loading talukas...' : 'Select Taluka'}</option>
              {talukas.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold mb-2 text-slate-400 uppercase tracking-wider">Village {loadingVillages && <Loader2 className="w-3 h-3 inline animate-spin"/>}</label>
            <select 
              value={selectedVillage} 
              onChange={e => setSelectedVillage(e.target.value)}
              className="w-full bg-black/40 border border-white/10 backdrop-blur-md rounded-xl p-2.5 text-sm focus:ring-1 focus:ring-brand-primary focus:outline-none transition-all"
              disabled={!selectedTaluka || loadingVillages}
            >
              <option value="">{loadingVillages ? 'Loading villages...' : 'Select Village'}</option>
              {villages.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
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
