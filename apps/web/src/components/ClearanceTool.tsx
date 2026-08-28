import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Download, AlertTriangle, CheckCircle, Crosshair } from 'lucide-react';
// Assuming MapboxDraw would be instantiated and controlled from MapLibre3DMap, 
// this tool interacts with the drawn polygons. We'll simulate the state for now 
// or accept it via props/store.

interface Conflict {
  utility_id: string;
  type: string;
  distance: number;
  severity: 'high' | 'medium' | 'low';
}

export const ClearanceTool: React.FC<{
  currentFootprintGeoJSON?: any;
}> = ({ currentFootprintGeoJSON }) => {
  const { currentRole } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [clearanceResult, setClearanceResult] = useState<{
    clear: boolean;
    conflicts: Conflict[];
    suggested_fix?: any;
  } | null>(null);

  // If role is not engineer, we don't show the tool
  if (currentRole !== 'engineer') return null;

  const handleCheck = async () => {
    if (!currentFootprintGeoJSON) {
      alert("Please draw a footprint first using the polygon tool.");
      return;
    }
    setLoading(true);
    try {
      // The ML service runs on port 8000
      const res = await fetch('http://localhost:8000/clearance-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          footprint: currentFootprintGeoJSON,
          depth_min_m: 0.0,
          depth_max_m: -5.0
        })
      });
      const data = await res.json();
      setClearanceResult(data);
    } catch (err) {
      console.error(err);
      alert("Failed to check clearance");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (!clearanceResult) return;
    try {
      const res = await fetch('http://localhost:4000/api/v1/certificate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-role': currentRole 
        },
        body: JSON.stringify({
          conflicts: clearanceResult.conflicts,
          footprint: currentFootprintGeoJSON
        })
      });
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Clearance_Certificate.pdf';
      a.click();
    } catch (err) {
      console.error(err);
      alert('Failed to export certificate');
    }
  };

  return (
    <div className="absolute top-5 right-5 glass-panel rounded-2xl p-4 max-w-sm pointer-events-auto bg-[#0b0f19]/90 border-brand-primary/50" style={{zIndex: 100}}>
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 mb-3">
        <Crosshair className="w-5 h-5 text-brand-primary" />
        <h3 className="text-sm font-bold text-white">Utility Clearance Check</h3>
      </div>
      
      <p className="text-xs text-slate-300 mb-4">
        Engineer Mode: Draw a footprint to check for clashes with underground utilities.
      </p>

      <button 
        onClick={handleCheck}
        disabled={loading}
        className="w-full mb-3 bg-brand-primary/20 hover:bg-brand-primary/40 text-brand-primary py-2 rounded font-bold text-xs"
      >
        {loading ? 'Analyzing...' : 'Run Clearance Check'}
      </button>

      {clearanceResult && (
        <div className="space-y-2 text-xs">
          {clearanceResult.clear ? (
            <div className="flex items-center gap-2 text-green-400 bg-green-400/10 p-2 rounded">
              <CheckCircle className="w-4 h-4" />
              <span>Footprint is clear!</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-2 rounded">
                <AlertTriangle className="w-4 h-4" />
                <span>{clearanceResult.conflicts.length} conflict(s) detected.</span>
              </div>
              <ul className="space-y-1 ml-2">
                {clearanceResult.conflicts.map((c, i) => (
                  <li key={i} className="text-slate-300">
                    - <span className={`font-bold ${c.severity === 'high' ? 'text-red-400' : 'text-amber-400'}`}>[{c.severity.toUpperCase()}]</span> {c.type} ({c.distance.toFixed(1)}m away)
                  </li>
                ))}
              </ul>
              {clearanceResult.suggested_fix && (
                <div className="text-brand-primary mt-1 p-2 bg-brand-primary/10 rounded">
                  Suggested Fix Geometry Generated! (Shown on map)
                </div>
              )}
            </div>
          )}

          <button 
            onClick={handleExport}
            className="w-full mt-2 flex justify-center items-center gap-2 bg-white/10 hover:bg-white/20 text-white py-2 rounded font-bold text-xs"
          >
            <Download className="w-4 h-4" /> Export Clearance Certificate
          </button>
        </div>
      )}
    </div>
  );
};
