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

  const { setActiveTab, setSearchQuery } = useAppStore();

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
        if (data.success) {
           setSearchQuery(searchVal);
           setActiveTab('MAPLIBRE_3D');
        }
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
    <div className="flex flex-col h-full w-full p-6 text-slate-200">
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
            <label className="block text-xs font-semibold mb-2 text-slate-400">DISTRICT {loadingDistricts && <Loader2 className="w-3 h-3 inline animate-spin"/>}</label>
            <select 
              value={selectedDistrict} 
              onChange={e => setSelectedDistrict(e.target.value)}
              className="w-full bg-[#070b14] border border-white/10 rounded-lg p-2 focus:ring-1 focus:ring-brand-primary"
              disabled={loadingDistricts}
            >
              <option value="">{loadingDistricts ? 'Loading districts...' : 'Select District'}</option>
              {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2 text-slate-400">TALUKA {loadingTalukas && <Loader2 className="w-3 h-3 inline animate-spin"/>}</label>
            <select 
              value={selectedTaluka} 
              onChange={e => setSelectedTaluka(e.target.value)}
              className="w-full bg-[#070b14] border border-white/10 rounded-lg p-2 focus:ring-1 focus:ring-brand-primary"
              disabled={!selectedDistrict || loadingTalukas}
            >
              <option value="">{loadingTalukas ? 'Loading talukas...' : 'Select Taluka'}</option>
              {talukas.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-2 text-slate-400">VILLAGE {loadingVillages && <Loader2 className="w-3 h-3 inline animate-spin"/>}</label>
            <select 
              value={selectedVillage} 
              onChange={e => setSelectedVillage(e.target.value)}
              className="w-full bg-[#070b14] border border-white/10 rounded-lg p-2 focus:ring-1 focus:ring-brand-primary"
              disabled={!selectedTaluka || loadingVillages}
            >
              <option value="">{loadingVillages ? 'Loading villages...' : 'Select Village'}</option>
              {villages.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-xl border border-white/10">
          <label className="block text-sm font-semibold mb-3">Search Cadastral Record</label>
          <div className="flex gap-3">
            <input 
              type="text" 
              placeholder="Enter Survey No, CTS, or ULPIN..."
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              className="flex-1 bg-[#070b14] border border-white/10 rounded-lg p-3 focus:ring-1 focus:ring-brand-primary"
            />
            <button 
              onClick={handleSearch}
              disabled={loading || !searchVal}
              className="bg-brand-primary text-[#070b14] font-bold px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-cyan-400 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
              Search
            </button>
          </div>
        </div>

        {result && (
          <div className={`p-4 rounded-xl border ${result.success ? 'border-emerald-500/30 bg-emerald-950/20' : 'border-red-500/30 bg-red-950/20'}`}>
            <h3 className="font-bold mb-2">{result.success ? 'Record Found' : 'Error'}</h3>
            {result.source && (
              <span className={`text-[10px] px-2 py-1 rounded font-mono ${result.source === 'mock' ? 'bg-orange-500/20 text-orange-400' : 'bg-brand-primary/20 text-brand-primary'}`}>
                SOURCE: {result.source === 'mock' ? 'MOCK DATA — DEVELOPMENT ONLY' : 'Maharashtra Government'}
              </span>
            )}
            <pre className="mt-4 text-xs font-mono overflow-auto text-slate-300">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
