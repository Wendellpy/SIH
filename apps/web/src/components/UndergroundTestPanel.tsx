'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Activity, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

export const UndergroundTestPanel: React.FC = () => {
  const { activeUndergroundLayerIds } = useAppStore();
  const [jsonStatus, setJsonStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [mcgmStatus, setMcgmStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show if URL has ?debug=underground
    if (typeof window !== 'undefined' && window.location.search.includes('debug=underground')) {
      setIsVisible(true);
      runDiagnostics();
    }
  }, []);

  const runDiagnostics = async () => {
    setJsonStatus('pending');
    setMcgmStatus('pending');

    // 1. Check JSON catalogue
    try {
      const res = await fetch('/underground-layers.json');
      if (res.ok) {
        const data = await res.json();
        if (data && data.categories) setJsonStatus('success');
        else setJsonStatus('error');
      } else {
        setJsonStatus('error');
      }
    } catch (e) {
      setJsonStatus('error');
    }

    // 2. Check MCGM API connectivity (Master Layer list)
    try {
      const res = await fetch('https://prsrvgisapp.mcgm.gov.in/server/rest/services/mcgm/MCGMGIS_Departments_Master_All_Layers/MapServer?f=pjson');
      if (res.ok) {
        setMcgmStatus('success');
      } else {
        setMcgmStatus('error');
      }
    } catch (e) {
      setMcgmStatus('error');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 glass-panel border-purple-500/50 p-4 rounded-xl shadow-2xl w-80 text-xs font-mono">
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
        <div className="flex items-center gap-2 text-purple-400 font-bold">
          <Activity className="w-4 h-4" />
          <span>Underground Diagnostics</span>
        </div>
        <button onClick={runDiagnostics} className="p-1 hover:bg-white/10 rounded">
          <RefreshCw className="w-3 h-3 text-slate-300" />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-300">Catalogue (JSON)</span>
          {jsonStatus === 'pending' && <span className="text-yellow-400">WAIT</span>}
          {jsonStatus === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
          {jsonStatus === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-slate-300">MCGM Server</span>
          {mcgmStatus === 'pending' && <span className="text-yellow-400">WAIT</span>}
          {mcgmStatus === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
          {mcgmStatus === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-300">Active Layers</span>
          <span className="text-cyan-300 font-bold">{activeUndergroundLayerIds.length} loaded</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-300">3D Tubes (R3F)</span>
          <span className={activeUndergroundLayerIds.length > 0 ? "text-emerald-400" : "text-slate-500"}>
            {activeUndergroundLayerIds.length > 0 ? "MOUNTED" : "IDLE"}
          </span>
        </div>
      </div>
    </div>
  );
};
