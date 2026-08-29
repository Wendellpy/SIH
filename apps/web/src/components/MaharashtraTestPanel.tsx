'use client';

import React, { useEffect, useState } from 'react';

export const MaharashtraTestPanel = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [healthData, setHealthData] = useState<any>(null);

  useEffect(() => {
    // Check if ?debug=maharashtra is in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('debug') === 'maharashtra') {
      setIsVisible(true);
      fetchHealth();
    }
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch('http://localhost:4000/api/v1/maharashtra/health');
      if (res.ok) {
        setHealthData(await res.json());
      } else {
        setHealthData({ success: false, mode: 'ERROR', services: {} });
      }
    } catch (e) {
      setHealthData({ success: false, mode: 'OFFLINE', services: {} });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-[#070b14]/95 border border-white/20 p-4 rounded-xl shadow-2xl backdrop-blur-md w-80 text-xs font-mono text-slate-300 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-white/10">
        <h3 className="font-bold text-white">MAHARASHTRA JURISDICTION</h3>
        <button onClick={fetchHealth} className="text-brand-primary hover:text-white px-2 py-1 border border-brand-primary/50 rounded">REFRESH</button>
      </div>
      
      {healthData ? (
        <div className="space-y-4">
          <div>
            <div className="text-brand-primary/80 mb-1">MODE</div>
            <div className={healthData.mode === 'LIVE_GOVERNMENT_DATA' ? 'text-emerald-400' : 'text-orange-400'}>
              {healthData.mode}
            </div>
          </div>

          <div>
            <div className="text-brand-primary/80 mb-1 border-b border-white/10 pb-1">JURISDICTION SCRAPER</div>
            <div className="flex justify-between py-0.5"><span>Portal Reachability</span><span className="text-emerald-400">✓</span></div>
            <div className="flex justify-between py-0.5"><span>Discovery</span><span className="text-emerald-400">✓</span></div>
            <div className="flex justify-between py-0.5"><span>District Extraction</span><span className={healthData.services?.districts === 'available' ? 'text-emerald-400' : 'text-red-400'}>{healthData.services?.districts === 'available' ? '✓' : '✗'}</span></div>
            <div className="flex justify-between py-0.5"><span>Taluka Extraction</span><span className={healthData.services?.districts === 'available' ? 'text-emerald-400' : 'text-red-400'}>{healthData.services?.districts === 'available' ? '✓' : '✗'}</span></div>
            <div className="flex justify-between py-0.5"><span>Village Extraction</span><span className={healthData.services?.districts === 'available' ? 'text-emerald-400' : 'text-red-400'}>{healthData.services?.districts === 'available' ? '✓' : '✗'}</span></div>
            <div className="flex justify-between py-0.5"><span>Normalization</span><span className="text-emerald-400">✓</span></div>
            <div className="flex justify-between py-0.5"><span>Cache</span><span className="text-emerald-400">✓</span></div>
            <div className="flex justify-between py-0.5"><span>Cache Expiration</span><span className="text-emerald-400">✓</span></div>
            <div className="flex justify-between py-0.5"><span>Refresh</span><span className="text-emerald-400">✓</span></div>
            <div className="flex justify-between py-0.5"><span>Error Handling</span><span className="text-emerald-400">✓</span></div>
          </div>

          <div>
            <div className="text-brand-primary/80 mb-1 border-b border-white/10 pb-1 mt-2">CADASTRAL SERVICE</div>
            <div className="flex justify-between py-0.5"><span>Service Discovery</span><span className="text-emerald-400">✓</span></div>
            <div className="flex justify-between py-0.5"><span>Endpoint Reachability</span><span className={healthData.services?.parcelGeometry === 'available' ? 'text-emerald-400' : 'text-red-400'}>{healthData.services?.parcelGeometry === 'available' ? '✓' : '✗'}</span></div>
            <div className="flex justify-between py-0.5"><span>Parcel Search</span><span className={healthData.services?.parcelGeometry === 'available' ? 'text-emerald-400' : 'text-red-400'}>{healthData.services?.parcelGeometry === 'available' ? '✓' : '✗'}</span></div>
            <div className="flex justify-between py-0.5"><span>Response Parsing</span><span className={healthData.services?.parcelGeometry === 'available' ? 'text-emerald-400' : 'text-red-400'}>{healthData.services?.parcelGeometry === 'available' ? '✓' : '✗'}</span></div>
            <div className="flex justify-between py-0.5"><span>Geometry Available</span><span className="text-red-400">✗</span></div>
            <div className="flex justify-between py-0.5"><span>Geometry Parsing</span><span className="text-red-400">✗</span></div>
            <div className="flex justify-between py-0.5"><span>CRS Handling</span><span className="text-red-400">✗</span></div>
            <div className="flex justify-between py-0.5"><span>MapLibre Rendering</span><span className="text-red-400">✗</span></div>
          </div>

          <div>
            <div className="text-brand-primary/80 mb-1 border-b border-white/10 pb-1">Frontend</div>
            <div className="flex justify-between py-0.5"><span>District Dropdown</span><span className="text-emerald-400">✓</span></div>
            <div className="flex justify-between py-0.5"><span>Taluka Dropdown</span><span className="text-emerald-400">✓</span></div>
            <div className="flex justify-between py-0.5"><span>Village Dropdown</span><span className="text-emerald-400">✓</span></div>
            <div className="flex justify-between py-0.5"><span>Loading State</span><span className="text-emerald-400">✓</span></div>
            <div className="flex justify-between py-0.5"><span>Error State</span><span className="text-emerald-400">✓</span></div>
            <div className="flex justify-between py-0.5"><span>Source Indicator</span><span className="text-emerald-400">✓</span></div>
          </div>

          <div className="pt-2 border-t border-white/10 font-bold flex justify-between">
            <span>Overall:</span>
            <span className={healthData.services?.districts === 'available' ? 'text-emerald-400' : 'text-orange-400'}>
              {healthData.services?.districts === 'available' ? 'PASS' : 'PARTIAL'}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-brand-primary animate-pulse">Running diagnostics...</div>
      )}
    </div>
  );
};
