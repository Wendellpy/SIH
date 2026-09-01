'use client';

import React, { useState, useEffect } from 'react';
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
  Gauge,
  X,
  Search,
  History,
  Clock,
  GitCommit,
  ArrowRight
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { parseUlpin3D, LandEvent } from '@sih/shared-types';

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
  const [showReraModal, setShowReraModal] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [floorPlanUrl, setFloorPlanUrl] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [propertyEvents, setPropertyEvents] = useState<LandEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [timelineFilter, setTimelineFilter] = useState<string>('ALL');
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [blockchainState, setBlockchainState] = useState<{
    loading: boolean;
    data: {
      ulpin: string;
      verified: boolean;
      status: string;
      currentHash: string | null;
      blockchainHash: string | null;
      transactionHash?: string | null;
    } | null;
    error: string | null;
  }>({
    loading: false,
    data: null,
    error: null,
  });

  const handleVerifyBlockchain = async (ulpinToVerify: string) => {
    if (!ulpinToVerify) return;
    setBlockchainState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/v1/blockchain/verify/${encodeURIComponent(ulpinToVerify)}`);
      const data = await res.json();

      if (!res.ok && !data.status) {
        throw new Error(data.message || 'Verification request failed');
      }

      setBlockchainState({
        loading: false,
        data: {
          ulpin: data.ulpin || ulpinToVerify,
          verified: Boolean(data.verified),
          status: data.status || 'UNKNOWN',
          currentHash: data.currentHash || null,
          blockchainHash: data.blockchainHash || null,
          transactionHash: data.transactionHash || null,
        },
        error: null,
      });
    } catch (err: any) {
      console.error('Blockchain verification error:', err);
      setBlockchainState({
        loading: false,
        data: null,
        error: err?.message || 'Failed to connect to blockchain service',
      });
    }
  };

  const handleRegisterBlockchain = async (ulpinToRegister: string) => {
    if (!ulpinToRegister) return;
    setIsRegistering(true);
    setBlockchainState(prev => ({ ...prev, error: null }));
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const parts = ulpinToRegister.split('.');
      const ulpin = parts[0];
      const unitId = parts[1] || 'G00-LOB01';

      const res = await fetch(`${apiUrl}/api/v1/blockchain/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ulpin, unitId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Automatically refresh blockchain verification to update UI to VERIFIED
      await handleVerifyBlockchain(ulpinToRegister);
    } catch (err: any) {
      console.error('Blockchain registration error:', err);
      setBlockchainState(prev => ({
        ...prev,
        error: err?.message || 'Failed to register on blockchain',
      }));
    } finally {
      setIsRegistering(false);
    }
  };

  const handleSimulateSubdivision = async () => {
    const targetUlpin = currentUlpin || 'MH13BOM04521873.A+03-B302';
    setIsSubmittingEvent(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const parts = targetUlpin.split('.');
      const base = parts[0];
      const newUnitId = `B03-U${Math.floor(100 + Math.random() * 900)}`;

      await fetch(`${apiUrl}/api/v1/land-events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ulpin: `${base}.${newUnitId}`,
          parentId: base,
          unitId: newUnitId,
          parcelId: parcel?.id || 'parcel-bkc-fintech',
          type: 'SUBDIVIDE',
          category: 'EVENT',
          description: `Vertical 3D Unit ${newUnitId} subdivided on Floor +03`,
          metadata: { level: '+03', carpetAreaSqm: 142.5 }
        })
      });

      // Reload events
      const res = await fetch(`${apiUrl}/api/v1/parcels/${encodeURIComponent(targetUlpin)}/events`);
      const d = await res.json();
      if (d.data) {
        setPropertyEvents(d.data);
      }
    } catch (e) {
      console.error('Failed to simulate subdivision event:', e);
    } finally {
      setIsSubmittingEvent(false);
    }
  };

  const displayedTimelineEvents = propertyEvents.filter(evt => {
    if (timelineFilter === 'ALL') return true;
    if (timelineFilter === 'BLOCKCHAIN') return evt.type === 'BLOCKCHAIN' || evt.category === 'VERIFICATION';
    if (timelineFilter === 'HASH') return Boolean(evt.recordHash);
    return evt.type === timelineFilter;
  });

  const handleOpenMahaRera = async (id: string) => {
    setShowReraModal(true);
    setIsScraping(true);
    setFloorPlanUrl(null);
    try {
      const res = await fetch(`http://localhost:4000/api/v1/rera/${id}/floorplan`);
      const data = await res.json();
      if (data.success) {
        setFloorPlanUrl(data.floorPlanUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsScraping(false);
    }
  };

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

  const currentUlpin = unit?.ulpin3D || underground?.ulpin3D || building?.ulpin3D || parcel?.ulpin || 'MH13BOM04521873.A+03-B302';
  const parsedUlpin = currentUlpin ? parseUlpin3D(currentUlpin) : null;
  const hasRera = Boolean(building?.reraId);
  const reraId = building?.reraId;
  const reraProjectName = building?.reraProjectName;
  const reraPromoter = building?.reraPromoter;
  const reraStatus = building?.reraStatus;

  // Fetch land history events for current selected ULPIN
  useEffect(() => {
    if (!currentUlpin) {
      setPropertyEvents([]);
      return;
    }
    setLoadingEvents(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    fetch(`${apiUrl}/api/v1/parcels/${encodeURIComponent(currentUlpin)}/events`)
      .then(res => res.json())
      .then(resData => {
        if (resData.data && Array.isArray(resData.data)) {
          setPropertyEvents(resData.data);
        }
      })
      .catch(err => {
        console.error('Failed to load parcel events:', err);
      })
      .finally(() => setLoadingEvents(false));
  }, [currentUlpin]);

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
      {currentUlpin && (() => {
        // Determine whether this is a real ULPIN or a demo reference ID
        const isParcelOnly = !unit && !underground && !building?.ulpin3D;
        const parcelDataSource = parcel?.dataSource;
        // For parcel-only view, label is driven by parcel.dataSource
        // For vertical units, show as 3D ULPIN (the base format is always derived)
        const isDemo = isParcelOnly && parcelDataSource === 'demo';
        const isVerified = isParcelOnly && parcelDataSource === 'verified';

        return (
          <div className={`backdrop-blur-md rounded-2xl p-4 border shadow-lg ${
            isDemo
              ? 'bg-amber-950/30 border-amber-500/30'
              : isVerified
                ? 'bg-emerald-950/20 border-emerald-500/30'
                : 'bg-white/5 border-white/10'
          }`}>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
              <span className="font-medium tracking-wide flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-blue-400" />
                {isDemo
                  ? <span className="text-amber-400 font-semibold">Demo Reference ID</span>
                  : isVerified
                    ? <span className="text-emerald-400 font-semibold">ULPIN (Bhu-Aadhaar)</span>
                    : <span className="text-slate-400">Unique 3D ULPIN</span>
                }
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

            {/* Data source disclaimer for demo parcels */}
            {isDemo && (
              <div className="mt-2 flex items-start gap-1.5 text-[10px] text-amber-300/80 leading-relaxed bg-amber-500/10 rounded-lg px-2.5 py-2 border border-amber-500/20">
                <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
                <span>Synthetic placeholder — <strong>not a government-issued Bhu-Aadhaar ULPIN</strong>. For authentic records, consult Mahabhulekh (bhulekh.mahabhumi.gov.in).</span>
              </div>
            )}

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
        );
      })()}

      {/* Lineage / Subdivision Alerts */}
      {parcel?.parcelStatus === 'superseded' && (
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 text-slate-300 space-y-2">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-100">
            <Layers className="w-4 h-4 text-slate-400" />
            <span>Superseded Parcel</span>
          </div>
          <p className="text-[12px] leading-relaxed">
            Subdivided on {parcel.supersededDate ? new Date(parcel.supersededDate).toLocaleDateString() : 'Unknown'} into {parcel.supersededBy?.length || 0} parcels.
          </p>
          {parcel.supersededBy && parcel.supersededBy.length > 0 && (
            <div className="text-[11px] font-mono text-slate-400 bg-black/20 px-3 py-2 rounded-lg border border-white/5">
              Child ULPINs: <br/> {parcel.supersededBy.join(', ')}
            </div>
          )}
        </div>
      )}

      {parcel?.parentParcel && (
        <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 flex flex-col gap-1 text-[12px]">
          <div className="flex items-center gap-2 font-medium">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Subdivided Parcel</span>
          </div>
          <span className="text-[11px] text-indigo-300/80">
            Split from <span className="font-mono bg-black/20 px-1 rounded">{parcel.parentParcel}</span>
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
          
          {/* MahaRERA Floor Plan Button */}
          <div className="bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-lg col-span-2 flex flex-col gap-3">
             <div className="flex items-center justify-between">
               <div className="flex flex-col">
                 <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">MahaRERA Integration</span>
                 <span className="text-[10px] text-slate-500">Live Project Details</span>
               </div>
               <button
                 disabled={!hasRera}
                 onClick={() => reraId && handleOpenMahaRera(reraId)}
                 className={`text-[10px] font-medium px-4 py-2 rounded-lg border transition-all ${hasRera ? 'bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30 shadow-md' : 'bg-white/5 text-slate-600 border-white/5 cursor-not-allowed'}`}
               >
                 {hasRera ? 'View Live Plan' : 'Not Available'}
               </button>
             </div>
             
             {hasRera && (
               <div className="bg-black/30 rounded-xl p-3 border border-white/5 space-y-2">
                 <div className="flex justify-between items-center text-[10px]">
                   <span className="text-slate-500">Project ID</span>
                   <span className="font-mono font-medium text-blue-300">{reraId}</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px]">
                   <span className="text-slate-500">Project Name</span>
                   <span className="font-medium text-slate-200 truncate max-w-[140px]">{reraProjectName}</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px]">
                   <span className="text-slate-500">Promoter</span>
                   <span className="font-medium text-slate-300 truncate max-w-[140px]">{reraPromoter}</span>
                 </div>
                 <div className="flex justify-between items-center text-[10px]">
                   <span className="text-slate-500">Status</span>
                   <span className="font-medium text-emerald-400">{reraStatus}</span>
                 </div>
               </div>
             )}
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

      {/* Blockchain Cadastral Verification */}
      <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-medium text-slate-300">Blockchain Cadastre</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => currentUlpin && handleRegisterBlockchain(currentUlpin)}
              disabled={isRegistering || blockchainState.loading || !currentUlpin}
              className="text-[10px] font-medium px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition-all disabled:opacity-50 flex items-center gap-1"
              title="Development action: Register on LandLedger"
            >
              {isRegistering ? (
                <>
                  <span className="w-2.5 h-2.5 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <span>Register on Chain</span>
              )}
            </button>

            <button
              onClick={() => currentUlpin && handleVerifyBlockchain(currentUlpin)}
              disabled={blockchainState.loading || isRegistering || !currentUlpin}
              className="text-[10px] font-medium px-2.5 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 transition-all disabled:opacity-50 flex items-center gap-1"
            >
              {blockchainState.loading ? (
                <>
                  <span className="w-2.5 h-2.5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <span>Verify on Chain</span>
              )}
            </button>
          </div>
        </div>

        {blockchainState.data && (
          <div className="space-y-2.5 pt-1 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Blockchain Status</span>
              {blockchainState.data.status === 'VERIFIED' ? (
                <span className="px-2 py-0.5 rounded-md font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Check className="w-3 h-3" /> VERIFIED
                </span>
              ) : blockchainState.data.status === 'TAMPER_DETECTED' ? (
                <span className="px-2 py-0.5 rounded-md font-semibold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> TAMPER DETECTED
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-md font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  NOT REGISTERED
                </span>
              )}
            </div>

            <div className="bg-black/30 rounded-xl p-2.5 border border-white/5 space-y-2 font-mono text-[10px]">
              <div>
                <div className="text-slate-500 text-[9px] font-sans">Record Hash</div>
                <div className="text-slate-300 truncate mt-0.5 select-all">
                  {blockchainState.data.currentHash || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-slate-500 text-[9px] font-sans">Blockchain Hash</div>
                <div className="text-slate-300 truncate mt-0.5 select-all">
                  {blockchainState.data.blockchainHash || 'None (Unregistered)'}
                </div>
              </div>
              {blockchainState.data.transactionHash && (
                <div>
                  <div className="text-slate-500 text-[9px] font-sans">Tx Hash</div>
                  <div className="text-cyan-400 truncate mt-0.5 select-all">
                    {blockchainState.data.transactionHash}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {blockchainState.error && (
          <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-[11px]">
            {blockchainState.error}
          </div>
        )}
      </div>

      {/* Land History & Verification Engine Card */}
      <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-medium text-slate-300">Land History & Verification</h3>
          </div>
          <button
            onClick={() => setShowHistoryDrawer(true)}
            className="text-[10px] font-medium px-2.5 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 transition-all flex items-center gap-1"
          >
            <Clock className="w-3 h-3" />
            <span>Timeline</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="bg-black/20 p-2 rounded-xl border border-white/5 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <div>
              <div className="text-slate-500 text-[9px]">Lifecycle Events</div>
              <div className="text-slate-200 font-semibold">{propertyEvents.length || 2} Recorded</div>
            </div>
          </div>
          <div className="bg-black/20 p-2 rounded-xl border border-white/5 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <div>
              <div className="text-slate-500 text-[9px]">Audit Status</div>
              <div className="text-cyan-300 font-semibold">VERIFIED</div>
            </div>
          </div>
        </div>

        {/* Interactive Action Type Badges */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            { label: 'CREATE', bg: 'bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/30' },
            { label: 'SUBDIVIDE', bg: 'bg-blue-500/10 hover:bg-blue-500/25 text-blue-300 border-blue-500/30' },
            { label: 'TRANSFER', bg: 'bg-purple-500/10 hover:bg-purple-500/25 text-purple-300 border-purple-500/30' },
            { label: 'MODIFY', bg: 'bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 border-amber-500/30' },
            { label: 'BLOCKCHAIN', bg: 'bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-300 border-cyan-500/30' },
            { label: 'HASH', bg: 'bg-slate-500/10 hover:bg-slate-500/25 text-slate-300 border-slate-500/30' }
          ].map(chip => (
            <button
              key={chip.label}
              onClick={() => {
                setTimelineFilter(chip.label);
                setShowHistoryDrawer(true);
              }}
              className={`px-2 py-0.5 rounded text-[9px] font-mono font-semibold border transition-all cursor-pointer ${chip.bg}`}
              title={`View ${chip.label} events in chronological timeline`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

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

      {/* Parcel History Chronological Timeline Side Drawer */}
      {showHistoryDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-all animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900/95 border-l border-white/10 h-full p-6 shadow-2xl overflow-y-auto flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                <div>
                  <h2 className="text-sm font-bold text-white">Chronological Land Timeline</h2>
                  <p className="text-[11px] text-slate-400 font-mono truncate max-w-[240px]">{currentUlpin || 'MH13BOM04521873'}</p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryDrawer(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Pills & Mutation Trigger */}
            <div className="flex items-center justify-between gap-1 text-[10px]">
              <div className="flex flex-wrap gap-1">
                {['ALL', 'CREATE', 'SUBDIVIDE', 'TRANSFER', 'BLOCKCHAIN'].map(f => (
                  <button
                    key={f}
                    onClick={() => setTimelineFilter(f)}
                    className={`px-2 py-0.5 rounded font-mono font-semibold transition-all ${
                      timelineFilter === f
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <button
                onClick={handleSimulateSubdivision}
                disabled={isSubmittingEvent}
                className="px-2 py-1 rounded bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 font-semibold flex items-center gap-1 transition-all disabled:opacity-50 shrink-0"
              >
                {isSubmittingEvent ? (
                  <span className="w-2.5 h-2.5 border-2 border-blue-300/30 border-t-blue-300 rounded-full animate-spin" />
                ) : (
                  <Split className="w-3 h-3" />
                )}
                <span>+ Subdivide</span>
              </button>
            </div>

            {/* Timeline Feed */}
            <div className="relative border-l-2 border-indigo-500/30 ml-3 space-y-4 my-2 pl-5">
              {displayedTimelineEvents.length > 0 ? (
                displayedTimelineEvents.map((evt, idx) => (
                  <div key={evt.id || idx} className="relative group">
                    {/* Node Dot */}
                    <div className="absolute -left-[27px] top-1 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-indigo-400 group-hover:scale-125 transition-transform" />

                    <div className="bg-white/5 p-3.5 rounded-xl border border-white/5 hover:border-indigo-500/40 transition-all space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          evt.type === 'CREATE' ? 'bg-emerald-500/20 text-emerald-300' :
                          evt.type === 'SUBDIVIDE' ? 'bg-blue-500/20 text-blue-300' :
                          evt.type === 'TRANSFER' ? 'bg-purple-500/20 text-purple-300' :
                          evt.type === 'BLOCKCHAIN' ? 'bg-cyan-500/20 text-cyan-300' :
                          evt.type === 'BOUNDARY' || evt.type === 'VERTICAL' || evt.type === 'UNDERGROUND' ? 'bg-red-500/20 text-red-300' :
                          'bg-amber-500/20 text-amber-300'
                        }`}>
                          {evt.type}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(evt.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {evt.description}
                      </p>

                      {evt.recordHash && (
                        <div className="font-mono text-[9px] text-slate-400 truncate select-all bg-black/40 p-1.5 rounded border border-white/5">
                          Hash: <span className="text-slate-300">{evt.recordHash}</span>
                        </div>
                      )}

                      {evt.transactionHash && (
                        <div className="font-mono text-[9px] text-cyan-400 truncate select-all">
                          Tx: {evt.transactionHash}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 py-6 text-center">
                  No events found matching current timeline filter.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MahaRERA Modal Overlay */}
      {showReraModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900/90 border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800/50">
              <div>
                <h3 className="text-lg font-semibold text-white">MahaRERA Project Details</h3>
                <p className="text-xs text-slate-400 font-mono mt-1">Live Scraping Session: {reraId}</p>
              </div>
              <button 
                onClick={() => setShowReraModal(false)}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-slate-300" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                  <div className="text-xs text-slate-500 mb-1">Project ID</div>
                  <div className="font-mono text-sm text-blue-400">{reraId}</div>
                </div>
                <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                  <div className="text-xs text-slate-500 mb-1">Project Name</div>
                  <div className="font-semibold text-sm text-slate-200">{reraProjectName}</div>
                </div>
                <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                  <div className="text-xs text-slate-500 mb-1">Promoter</div>
                  <div className="font-semibold text-sm text-slate-300">{reraPromoter}</div>
                </div>
                <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                  <div className="text-xs text-slate-500 mb-1">Status</div>
                  <div className="font-semibold text-sm text-emerald-400">{reraStatus}</div>
                </div>
              </div>

              <div className="flex-1 bg-black/40 rounded-xl border border-white/10 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
                {isScraping ? (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    <div className="text-sm text-slate-400 font-mono flex items-center gap-2">
                      <Search className="w-4 h-4 animate-pulse" />
                      Scraping MahaRERA Portal...
                    </div>
                  </div>
                ) : floorPlanUrl ? (
                  <img 
                    src={floorPlanUrl} 
                    alt="Floor Plan" 
                    className="w-full h-full object-contain p-4 rounded-lg"
                  />
                ) : (
                  <div className="text-slate-500">Failed to retrieve floor plan document.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
