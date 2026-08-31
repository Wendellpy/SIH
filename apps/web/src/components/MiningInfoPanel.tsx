'use client';

import React, { useState } from 'react';
import { 
  MapPin, 
  Mountain, 
  Leaf, 
  Activity, 
  CheckCircle,
  X,
  AlertTriangle,
  Info,
  Navigation,
  Globe2
} from 'lucide-react';
import { useAppStore } from '@/lib/store';

export const MiningInfoPanel: React.FC = () => {
  const { selectedMiningArea, setSelectedMiningArea } = useAppStore();

  if (!selectedMiningArea) return null;

  return (
    <div className="absolute top-24 left-5 w-[420px] max-h-[80vh] overflow-y-auto glass-panel rounded-2xl p-5 border border-white/10 shadow-2xl z-50 bg-[#0b0f19]/90 text-slate-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-orange-500/20 text-orange-400 border border-orange-500/30">
              MINING AREA
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono border flex items-center gap-1 ${
              selectedMiningArea.dataSource === 'demo' 
                ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                : selectedMiningArea.dataSource === 'verified'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            }`}>
              <Globe2 className="w-3 h-3" /> {selectedMiningArea.dataSource.toUpperCase()} DATA
            </span>
          </div>
          <h2 className="text-xl font-bold text-white leading-tight">{selectedMiningArea.name}</h2>
          <div className="text-sm text-slate-400 flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5" /> 
            {selectedMiningArea.tehsil}, {selectedMiningArea.district}, {selectedMiningArea.state}
          </div>
        </div>
        <button 
          onClick={() => setSelectedMiningArea(null)}
          className="p-1 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Core Info */}
        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-orange-400" /> Basic Information
          </h3>
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
            <div className="text-slate-500">ID</div>
            <div className="font-mono text-white text-right">{selectedMiningArea.id}</div>
            
            <div className="text-slate-500">Mineral</div>
            <div className="font-medium text-white text-right">{selectedMiningArea.mineral}</div>
            
            <div className="text-slate-500">Type</div>
            <div className="font-medium text-white text-right">{selectedMiningArea.miningType}</div>
            
            <div className="text-slate-500">Status</div>
            <div className="font-medium text-right flex justify-end">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                selectedMiningArea.operationalStatus === 'ACTIVE' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
                {selectedMiningArea.operationalStatus}
              </span>
            </div>
            
            <div className="text-slate-500">Area</div>
            <div className="font-medium text-white text-right">{(selectedMiningArea.areaSqm / 10000).toFixed(2)} Hectares</div>
          </div>
        </div>

        {/* Underground Network Stats */}
        {selectedMiningArea.undergroundNetwork && (
          <div className="p-3 bg-purple-900/10 rounded-xl border border-purple-500/20 relative overflow-hidden">
             {selectedMiningArea.dataSource === 'demo' && (
               <div className="absolute -right-6 top-4 bg-purple-500 text-white text-[9px] font-bold py-0.5 px-8 rotate-45">
                 DEMO
               </div>
            )}
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" /> Underground Network
            </h3>
            
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs mb-3 border-b border-purple-500/20 pb-3">
              <div className="text-slate-500">Total Nodes</div>
              <div className="font-medium text-white text-right">{selectedMiningArea.undergroundNetwork.nodes.length}</div>
              
              <div className="text-slate-500">Total Segments</div>
              <div className="font-medium text-white text-right">{selectedMiningArea.undergroundNetwork.segments.length}</div>
              
              <div className="text-slate-500">Total Length</div>
              <div className="font-medium text-white text-right">
                {selectedMiningArea.undergroundNetwork.segments.reduce((acc, seg) => acc + (seg.lengthM || 0), 0)}m
              </div>
            </div>

            <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
              {selectedMiningArea.undergroundNetwork.segments.map((seg, idx) => (
                <div key={idx} className="bg-black/40 p-2 rounded flex justify-between items-center border border-white/5">
                  <div>
                    <div className="text-[10px] font-mono text-slate-300">{seg.uldpn}</div>
                    <div className="text-[9px] text-slate-500 uppercase">{seg.featureType}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white">{seg.lengthM}m</div>
                    <div className="text-[10px] text-emerald-400">-{seg.depthBelowSurfaceM}m Depth</div>
                    {seg.deformationCorrelation && (
                      <div className={`mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded text-right w-max ml-auto ${
                        seg.deformationCorrelation.analyticalStatus === 'high_deformation_investigation_recommended'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : seg.deformationCorrelation.analyticalStatus === 'deformation_detected'
                          ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                          : seg.deformationCorrelation.analyticalStatus === 'monitor'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-green-500/20 text-green-400 border border-green-500/30'
                      }`}>
                        {seg.deformationCorrelation.analyticalStatus.replace(/_/g, ' ').toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* InSAR Time Series */}
        {selectedMiningArea.insarTimeSeries ? (
          <div className="p-3 bg-red-900/10 rounded-xl border border-red-500/20 relative overflow-hidden">
            <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4" /> InSAR Deformation (LOS)
            </h3>
            
            <div className="flex justify-between items-end mb-4">
              <div>
                <div className="text-xs text-slate-400">Trend</div>
                <div className="font-bold text-white uppercase text-sm">{selectedMiningArea.insarTimeSeries.trend}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Velocity</div>
                <div className="font-mono font-bold text-red-400 text-lg">{selectedMiningArea.insarTimeSeries.velocityMmPerYear} mm/yr</div>
              </div>
            </div>

            {/* Simple CSS Bar Chart for Time Series */}
            <div className="mt-4 pt-2 border-t border-white/10">
              <div className="text-[10px] text-slate-500 mb-2 uppercase">Cumulative LOS Displacement (mm)</div>
              <div className="flex items-end justify-between h-20 gap-1 mt-6">
                {selectedMiningArea.insarTimeSeries.observations.map((obs, idx) => {
                  // Normalize height for the mock demo (max ~150mm)
                  const heightPct = Math.min(100, Math.max(5, (Math.abs(obs.cumulativeDisplacementMm) / 150) * 100));
                  return (
                    <div key={idx} className="relative flex flex-col items-center flex-1 group">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-6 bg-black text-white text-[9px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap border border-white/20">
                        {obs.cumulativeDisplacementMm} mm
                      </div>
                      
                      {/* Bar (growing downward visually by using mt-auto, but we flip it so it grows up) */}
                      <div 
                        className={`w-full rounded-t-sm transition-all ${obs.coherence < 0.6 ? 'bg-slate-600' : 'bg-red-500'}`}
                        style={{ height: `${heightPct}%` }}
                      />
                      <div className="text-[8px] text-slate-500 mt-1 origin-top-left -rotate-45 whitespace-nowrap overflow-visible">
                        {obs.date.substring(5,10)}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-4 text-[9px] text-slate-400 text-right">
                * Gray bars indicate low coherence (&lt; 0.6)
              </div>
            </div>
            <div className="mt-4 pt-2 border-t border-white/10">
              <h4 className="text-[10px] text-slate-500 mb-2 uppercase">Data Sources & Processing</h4>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px]">
                <div className="text-slate-500">Sensor</div>
                <div className="text-white text-right">Sentinel-1A</div>
                <div className="text-slate-500">Method</div>
                <div className="text-white text-right">DInSAR</div>
                <div className="text-slate-500">DEM Source</div>
                <div className="text-white text-right">Copernicus 30m</div>
                <div className="text-slate-500">Coh. Threshold</div>
                <div className="text-white text-right">&gt; 0.6</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-white/5 rounded-xl border border-white/5 opacity-70">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-500" /> InSAR Deformation (LOS)
            </h3>
            <div className="text-xs text-slate-500 italic p-2 border border-dashed border-slate-700 rounded text-center">
              No processed InSAR time-series available.
            </div>
          </div>
        )}

        {/* GNSS / CORS */}
        {selectedMiningArea.gnssMetaData && (
          <div className="p-3 bg-cyan-900/10 rounded-xl border border-cyan-500/20 relative overflow-hidden">
            {selectedMiningArea.gnssMetaData.isProposed && (
               <div className="absolute -right-6 top-4 bg-cyan-500 text-black text-[9px] font-bold py-0.5 px-8 rotate-45">
                 PROPOSED
               </div>
            )}
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Navigation className="w-4 h-4" /> GNSS / CORS Positioning
            </h3>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
              <div className="text-slate-500">Survey ID</div>
              <div className="font-mono text-white text-right">{selectedMiningArea.gnssMetaData.surveyId}</div>
              
              <div className="text-slate-500">Fix Type</div>
              <div className="font-mono text-emerald-400 text-right">{selectedMiningArea.gnssMetaData.fixType}</div>
              
              <div className="text-slate-500">Accuracy (H/V)</div>
              <div className="font-medium text-white text-right">
                ±{selectedMiningArea.gnssMetaData.horizontalAccuracyM}m / ±{selectedMiningArea.gnssMetaData.verticalAccuracyM}m
              </div>
              
              <div className="text-slate-500">CORS Station</div>
              <div className="font-medium text-white text-right truncate" title={selectedMiningArea.gnssMetaData.corsReferenceStation}>
                {selectedMiningArea.gnssMetaData.corsReferenceStation}
              </div>

              <div className="text-slate-500">Method</div>
              <div className="font-medium text-white text-right">{selectedMiningArea.gnssMetaData.correctionMethod}</div>
              
              <div className="text-slate-500">Satellites</div>
              <div className="font-medium text-white text-right">{selectedMiningArea.gnssMetaData.satellitesUsed}</div>
            </div>
          </div>
        )}

        {/* Terrain Metrics */}
        {selectedMiningArea.terrainMetrics && (
          <div className="p-3 bg-white/5 rounded-xl border border-white/5 relative overflow-hidden">
            {selectedMiningArea.terrainMetrics.isSynthetic && (
               <div className="absolute -right-6 top-4 bg-purple-500 text-white text-[9px] font-bold py-0.5 px-8 rotate-45">
                 SYNTHETIC
               </div>
            )}
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Mountain className="w-4 h-4 text-purple-400" /> Terrain Analysis (DEM)
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="bg-black/30 rounded p-2 text-center">
                <div className="text-[10px] text-slate-500 uppercase">Min Elev</div>
                <div className="font-bold text-white">{selectedMiningArea.terrainMetrics.minElevationM}m</div>
              </div>
              <div className="bg-black/30 rounded p-2 text-center border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.1)]">
                <div className="text-[10px] text-purple-300 uppercase">Mean Elev</div>
                <div className="font-bold text-purple-100">{selectedMiningArea.terrainMetrics.meanElevationM}m</div>
              </div>
              <div className="bg-black/30 rounded p-2 text-center">
                <div className="text-[10px] text-slate-500 uppercase">Max Elev</div>
                <div className="font-bold text-white">{selectedMiningArea.terrainMetrics.maxElevationM}m</div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
              <div className="text-slate-500">Slope (Min/Max/Avg)</div>
              <div className="font-medium text-white text-right">
                {selectedMiningArea.terrainMetrics.minSlopeDeg}° / {selectedMiningArea.terrainMetrics.maxSlopeDeg}° / {selectedMiningArea.terrainMetrics.meanSlopeDeg}°
              </div>
              <div className="text-slate-500">Classification</div>
              <div className="font-medium text-white text-right">{selectedMiningArea.terrainMetrics.slopeClassification}</div>
              <div className="text-slate-500">Predominant Aspect</div>
              <div className="font-medium text-white text-right">{selectedMiningArea.terrainMetrics.predominantAspect}</div>
            </div>
          </div>
        )}

        {/* Environmental */}
        {selectedMiningArea.environmentalProximity && (
          <div className="p-3 bg-white/5 rounded-xl border border-white/5 relative overflow-hidden">
             {selectedMiningArea.environmentalProximity.isSynthetic && (
               <div className="absolute -right-6 top-4 bg-emerald-600 text-white text-[9px] font-bold py-0.5 px-8 rotate-45">
                 SYNTHETIC
               </div>
            )}
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-400" /> Environmental Proximity
            </h3>
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
              <div className="text-slate-500">Nearest Water Body</div>
              <div className="font-medium text-blue-300 text-right">{selectedMiningArea.environmentalProximity.nearestWaterBodyDistM}m</div>
              
              <div className="text-slate-500">Nearest Settlement</div>
              <div className="font-medium text-orange-300 text-right">{selectedMiningArea.environmentalProximity.nearestSettlementDistM}m</div>
              
              <div className="text-slate-500">Nearest Forest</div>
              <div className="font-medium text-emerald-300 text-right">{selectedMiningArea.environmentalProximity.nearestForestDistM}m</div>
              
              <div className="text-slate-500">Eco-Sensitive Zone</div>
              <div className="font-medium text-right">
                {selectedMiningArea.environmentalProximity.ecoSensitiveZoneIntersection ? 
                  <span className="text-red-400 font-bold flex items-center justify-end gap-1"><AlertTriangle className="w-3 h-3"/> YES</span> : 
                  <span className="text-emerald-400 flex items-center justify-end gap-1"><CheckCircle className="w-3 h-3"/> NO</span>
                }
              </div>
            </div>
          </div>
        )}

        {/* Incidents (Future Scope logic) */}
        <div className="p-3 bg-white/5 rounded-xl border border-white/5 opacity-70">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-400" /> Incident Correlation
          </h3>
          <div className="text-xs text-slate-400 italic text-center p-2 border border-dashed border-slate-700 rounded">
            Incident data correlation is documented as Future Scope.
          </div>
        </div>

        {/* Analytical Risk Indicator */}
        {selectedMiningArea.analyticalRiskIndicator !== null && (
          <div className="p-4 bg-gradient-to-br from-rose-900/40 to-black rounded-xl border border-rose-500/30">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Analytical Risk Indicator</h3>
              <div className="text-2xl font-black text-rose-400 font-mono">{selectedMiningArea.analyticalRiskIndicator}<span className="text-sm text-rose-400/50">/100</span></div>
            </div>
            <p className="text-[10px] text-rose-200/60 leading-tight">
              *System-generated analytical indicator based on available geospatial data (incident correlation not yet available). 
              <span className="font-bold text-rose-400"> Derived entirely from synthetic inputs.</span>
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
