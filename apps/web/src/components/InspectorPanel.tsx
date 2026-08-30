'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Layers, 
  ShieldCheck, 
  AlertTriangle, 
  Copy, 
  Check, 
  Maximize2, 
  FileCheck, 
  Info, 
  Sparkles, 
  Split, 
  User, 
  Hash, 
  ChevronRight,
  Gauge
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { parseUlpin3D } from '@sih/shared-types';

export const InspectorPanel: React.FC = () => {
  const { 
    selectedParcel, 
    selectedBuilding, 
    selectedUnit, 
    selectedUnderground,
    setSelectedUnit,
    setActiveTab,
    resolveConflict,
    topologyLogs,
    changeEvents,
    temporalYear
  } = useAppStore();

  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPropertyCard = async (ulpin: string) => {
    try {
      setIsDownloading(true);
      
      // Grab the MapLibre canvas (or R3F canvas)
      const canvas = document.querySelector('canvas');
      let thumbnailBase64 = '';
      if (canvas) {
        thumbnailBase64 = canvas.toDataURL('image/jpeg', 0.8);
      }

      const response = await fetch(`http://localhost:4000/api/v1/units/${ulpin}/property-card`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          thumbnailBase64,
          simulatedData: unit || underground || building || parcel,
          simulatedType: unit ? 'VerticalUnit' : (underground ? 'UndergroundAsset' : (building ? 'Building' : 'Parcel'))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate card');
      }

      // Download the PDF blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Property_Card_${ulpin}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      console.error(err);
      alert('Error generating Property Card');
    } finally {
      setIsDownloading(false);
    }
  };

  // If nothing is selected, show default parcel overview
  const parcel = selectedParcel;
  const building = selectedBuilding;
  const unit = selectedUnit;
  const underground = selectedUnderground;

  const currentUlpin = unit ? unit.ulpin3D : (underground ? underground.ulpin3D : (building ? building.ulpin3D : (parcel ? parcel.ulpin : '')));
  const parsedUlpin = currentUlpin ? parseUlpin3D(currentUlpin) : null;

  // Check if current entity has a topology conflict
  const conflictLog = topologyLogs.find(
    l => l.ulpin3DPrimary === currentUlpin || l.ulpin3DColliding === currentUlpin
  );

  const relevantChanges = changeEvents.filter(ce => {
    if (ce.propertyId !== building?.id && ce.propertyId !== currentUlpin) return false;
    const year = parseInt(ce.detectedDate.split('-')[0], 10);
    return year <= temporalYear;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel bg-black/40 backdrop-blur-xl rounded-2xl p-6 shadow-2xl w-[380px] border border-white/10 flex flex-col h-full max-h-[calc(100vh-5.5rem)] overflow-y-auto space-y-5 custom-scrollbar">
      {/* Title & Badge */}
      <div className="flex items-center justify-between pb-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-brand-primary/20 text-brand-primary border border-brand-primary/30">
            {unit ? <Split className="w-4 h-4" /> : (underground ? <Layers className="w-4 h-4 text-amber-400" /> : <Building2 className="w-4 h-4" />)}
          </div>
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              {unit ? '3D Vertical Property Unit' : (underground ? 'Subterranean Infrastructure' : 'Cadastral Parcel & Building')}
            </h2>
            <span className="text-[10px] text-slate-400 font-mono">
              DoLR Spatial Entity Inspector
            </span>
          </div>
        </div>

        {/* Provenance Badge */}
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-100 text-slate-300 border border-white/10 font-medium">
          {unit?.provenance || 'BMC GIS'}
        </span>
      </div>

      {/* 3D ULPIN Identity Banner */}
      {currentUlpin && (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-lg">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
            <span className="font-medium tracking-wide flex items-center gap-1.5 text-slate-400">
              <Hash className="w-3.5 h-3.5 text-blue-400" />
              Unique 3D ULPIN
            </span>
            <button
              onClick={() => handleCopy(currentUlpin)}
              className="flex items-center gap-1 text-brand-primary hover:text-white transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="text-sm font-mono font-medium text-slate-100 tracking-wider break-all select-all bg-black/30 px-3 py-2 rounded-lg border border-white/5 shadow-inner">
            {currentUlpin}
          </div>

          {/* 3D ULPIN Decomposition Breakdown */}
          {parsedUlpin && (
            <div className="mt-3 grid grid-cols-4 gap-1.5 text-center font-mono text-[9px] pt-3 border-t border-white/5">
              <div className="bg-white/5 p-1.5 rounded-md">
                <div className="text-slate-500 text-[9px] font-sans">BASE</div>
                <div className="text-slate-300 font-medium truncate mt-0.5">{parsedUlpin.baseUlpin.slice(-6)}</div>
              </div>
              <div className="bg-white/5 p-1.5 rounded-md">
                <div className="text-slate-500 text-[9px] font-sans">DOMAIN</div>
                <div className="text-slate-300 font-medium mt-0.5">{parsedUlpin.domainCode}</div>
              </div>
              <div className="bg-white/5 p-1.5 rounded-md">
                <div className="text-slate-500 text-[9px] font-sans">LEVEL</div>
                <div className="text-slate-300 font-medium mt-0.5">{parsedUlpin.levelCode}</div>
              </div>
              <div className="bg-white/5 p-1.5 rounded-md">
                <div className="text-slate-500 text-[9px] font-sans">UNIT</div>
                <div className="text-slate-300 font-medium truncate mt-0.5">{parsedUlpin.unitCode}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Validation & Conflict Status Alert */}
      {unit?.validationStatus === 'CONFLICT' || conflictLog ? (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 space-y-2">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Topology Conflict Detected</span>
          </div>
          <p className="text-[12px] text-red-200/80 leading-relaxed">
            {conflictLog?.message || 'Vertical 3D solid overlap detected with adjacent unit bounding box.'}
          </p>
          {conflictLog?.details?.overlapVolumeCum && (
            <div className="text-[11px] font-mono text-red-200/70 bg-black/20 px-3 py-2 rounded-lg border border-red-500/10">
              Volume: {conflictLog.details.overlapVolumeCum} m³ &bull; Range: [{conflictLog.details.elevationZRange?.join('m to ')}m]
            </div>
          )}
          {conflictLog?.status === 'OPEN' && (
            <button
              onClick={() => resolveConflict(conflictLog.id)}
              className="mt-3 w-full py-2 px-3 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-medium transition-all shadow-sm"
            >
              Resolve in DoLR Verifier Portal
            </button>
          )}
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 flex items-center justify-between text-[13px]">
          <div className="flex items-center gap-2 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>3D Topology Validated</span>
          </div>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            WATERTIGHT SOLID
          </span>
        </div>
      )}

      {/* Temporal Change Alerts */}
      {relevantChanges.map(change => (
        <div key={change.id} className="p-3 rounded-xl bg-orange-950/40 border border-orange-500/50 text-orange-200 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-orange-400">
            <AlertTriangle className="w-4 h-4 text-orange-400 animate-pulse" />
            <span>POTENTIAL CHANGE DETECTED</span>
          </div>
          <p className="text-[11px] text-orange-300/90 leading-tight">
            {change.changeType.replace('_', ' ')} detected via temporal GIS layer.
          </p>
          <div className="text-[10px] font-mono text-orange-200/80 bg-orange-900/30 px-2 py-1.5 rounded space-y-1">
            <div className="font-bold text-orange-300">{change.oldValue} &rarr; {change.newValue}</div>
            <div className="text-orange-400/80 flex justify-between pt-1 border-t border-orange-500/20">
              <span>Confidence: {(change.confidence * 100).toFixed(0)}%</span>
              <span>Source: {change.source}</span>
            </div>
            <div className="text-orange-400/80 flex justify-between">
              <span>Date: {change.detectedDate}</span>
              <span>Status: {change.status}</span>
            </div>
          </div>
        </div>
      ))}

      {/* 3D Geometry Metrics Grid */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-medium text-slate-400 flex items-center gap-2">
          <Gauge className="w-4 h-4 text-blue-400" />
          Spatial Measurements
        </h3>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-lg">
            <div className="text-[11px] text-slate-500 mb-1">Carpet / Usable Area</div>
            <div className="text-[15px] font-medium text-slate-100">
              {unit?.carpetAreaSqm ? `${unit.carpetAreaSqm} m²` : (parcel?.areaSqm ? `${parcel.areaSqm} m²` : 'N/A')}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {unit?.carpetAreaSqm ? `~${(unit.carpetAreaSqm * 10.764).toFixed(0)} sq.ft` : ''}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-lg">
            <div className="text-[11px] text-slate-500 mb-1">3D Solid Volume</div>
            <div className="text-[15px] font-medium text-slate-100">
              {unit?.volumeCum ? `${unit.volumeCum} m³` : (underground ? `${underground.diameterMm}mm Pipe` : 'N/A')}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Height Δ: {unit ? `${(unit.zMax - unit.zMin).toFixed(2)}m` : 'N/A'}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-lg col-span-2">
            <div className="text-[11px] text-slate-500 flex items-center justify-between mb-2">
              <span>Vertical Elevation Range (Z)</span>
              <span className="text-slate-500">Datum: WGS84 MSL</span>
            </div>
            <div className="text-sm font-medium text-slate-300 flex items-center justify-between bg-black/20 p-2 rounded-lg border border-white/5">
              <span>{unit ? `+${unit.zMin}m` : (underground ? `${underground.depthMinM}m` : '+4.5m')}</span>
              <span className="text-slate-600">→</span>
              <span>{unit ? `+${unit.zMax}m` : (underground ? `${underground.depthMaxM}m` : '+68.5m')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ownership & Cadastral KYC */}
      <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg space-y-3 mt-2">
        <h3 className="text-xs font-medium text-slate-400 flex items-center gap-2">
          <User className="w-4 h-4 text-blue-400" />
          Ownership & Tenure
        </h3>

        <div className="space-y-2.5 text-[13px]">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Registered Owner</span>
            <span className="font-medium text-slate-200 text-right truncate max-w-[180px]">
              {unit?.ownerName || (underground?.owningAgency || parcel?.ownershipType || 'Government of Maharashtra')}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Owner Identifier</span>
            <span className="text-slate-300">
              {unit?.ownerId || 'GOV-MH-CADASTRE'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Use Classification</span>
            <span className="px-2 py-1 rounded-md text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/10">
              {unit?.useType || (underground ? 'Municipal Infrastructure' : 'Mixed Commercial')}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-slate-500">Property Tax Status</span>
            <span className="text-emerald-400 font-medium text-[12px]">
              {unit?.taxStatus || 'PAID (FY 2026-27)'}
            </span>
          </div>
        </div>
      </div>

      {/* Parent Building & Survey Coordinates */}
      {building && (
        <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg space-y-1.5 text-[13px]">
          <div className="text-xs text-slate-500 font-medium pb-1">Building Location</div>
          <div className="font-medium text-slate-200">{building.name}</div>
          <p className="text-slate-400 leading-relaxed text-[12px]">{building.address}</p>
          <div className="pt-2 mt-2 flex items-center justify-between text-[12px] text-slate-500 border-t border-white/5">
            <span>Floors: <span className="text-slate-300">{building.numFloors}</span></span>
            <span>Survey: <span className="text-slate-300">{parcel?.surveyNumber}</span></span>
          </div>
        </div>
      )}

      {/* Interactive Actions */}
      <div className="pt-2 pb-2 flex flex-col gap-2.5">
        <button
          onClick={() => setActiveTab('EXPLODED_3D')}
          className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-[13px] font-bold tracking-wide flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_25px_rgba(14,165,233,0.5)] transition-all border border-cyan-400/50"
        >
          <Layers className="w-4 h-4" />
          Drill Down in Exploded 3D View
        </button>

        <button
          onClick={() => currentUlpin && handleDownloadPropertyCard(currentUlpin)}
          disabled={isDownloading || !currentUlpin}
          className="w-full py-2.5 px-4 rounded-2xl glass-panel bg-white/5 hover:bg-white/10 text-slate-300 text-[13px] font-medium border border-white/10 shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          <FileCheck className="w-4 h-4 text-emerald-400" />
          {isDownloading ? 'Generating...' : 'Download Property Card'}
        </button>
      </div>
    </div>
  );
};
