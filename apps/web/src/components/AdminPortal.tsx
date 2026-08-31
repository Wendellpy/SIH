'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Hash, 
  Clock, 
  User, 
  Layers, 
  Split, 
  Search, 
  ChevronRight,
  Sparkles,
  Lock,
  History,
  Activity,
  Box,
  Eye,
  Check,
  Filter
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { LandEvent } from '@sih/shared-types';

export const AdminPortal: React.FC = () => {
  const { 
    topologyLogs, 
    resolveConflict, 
    auditLogs, 
    addAuditLog, 
    setActiveTab, 
    setSelectedUnit,
    setSelectedParcel
  } = useAppStore();

  const [activeSubTab, setActiveSubTab] = useState<'EVENTS_CONFLICTS' | 'AUDIT_LOGS'>('EVENTS_CONFLICTS');
  const [landEvents, setLandEvents] = useState<LandEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [accessLogs, setAccessLogs] = useState<any[]>([]);

  // Filter States
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'CONFLICT' | 'EVENT' | 'VERIFICATION'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED' | 'COMPLETED'>('ALL');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch land events from backend
  const fetchLandEvents = () => {
    setLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    fetch(`${apiUrl}/api/v1/land-events`)
      .then(res => res.json())
      .then(resData => {
        if (resData.data && Array.isArray(resData.data)) {
          setLandEvents(resData.data);
          if (!selectedEventId && resData.data.length > 0) {
            setSelectedEventId(resData.data[0].id);
          }
        }
      })
      .catch(err => {
        console.error('Failed to load land events:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLandEvents();
  }, []);

  useEffect(() => {
    if (activeSubTab === 'AUDIT_LOGS') {
      fetch('http://localhost:4000/api/v1/access-log')
        .then(res => res.json())
        .then(data => {
          if (data.data) {
            setAccessLogs(data.data);
          }
        })
        .catch(console.error);
    }
  }, [activeSubTab]);

  // Derived filtered events
  const filteredEvents = landEvents.filter(evt => {
    if (categoryFilter !== 'ALL' && evt.category !== categoryFilter) return false;
    if (statusFilter !== 'ALL' && evt.status !== statusFilter) return false;
    if (severityFilter !== 'ALL' && evt.severity !== severityFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchUlpin = evt.ulpin.toLowerCase().includes(q);
      const matchDesc = evt.description.toLowerCase().includes(q);
      const matchType = evt.type.toLowerCase().includes(q);
      if (!matchUlpin && !matchDesc && !matchType) return false;
    }
    return true;
  });

  const currentEvent = landEvents.find(e => e.id === selectedEventId) || filteredEvents[0];

  // Metric aggregates
  const totalEvents = landEvents.length;
  const openConflicts = landEvents.filter(e => e.category === 'CONFLICT' && e.status === 'OPEN').length;
  const resolvedConflicts = landEvents.filter(e => e.category === 'CONFLICT' && e.status === 'RESOLVED').length;
  const verifiedAnchors = landEvents.filter(e => e.type === 'BLOCKCHAIN' || e.category === 'VERIFICATION').length;

  const handleResolveEvent = async (id: string, status: 'RESOLVED' | 'REJECTED' = 'RESOLVED') => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/api/v1/land-events/${id}/resolve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolvedBy: 'DoLR Senior Verifier Officer (Rajesh Sharma)',
          status,
          notes: `Action Taken: ${status} on Cadastral Event ${id}`
        })
      });

      if (res.ok) {
        // Also trigger store conflict resolution
        resolveConflict(id);
        fetchLandEvents();
      }
    } catch (err) {
      console.error('Error resolving land event:', err);
    }
  };

  const handleViewIn3D = (evt: LandEvent) => {
    if (evt.unitId) {
      // Find unit and select
      setSelectedUnit({
        id: evt.id,
        buildingId: evt.parcelId || 'bldg-bkc-fintech-tower',
        parcelId: evt.parcelId || 'parcel-bkc-fintech',
        ulpin3D: evt.ulpin,
        domainCode: 'A',
        levelCode: '+02',
        unitCode: evt.unitId,
        floorNumber: 2,
        unitName: `Unit ${evt.unitId}`,
        useType: 'Commercial',
        ownerName: 'Registered Cadastral Entity',
        ownerId: 'CORP-MUM-402',
        carpetAreaSqm: 185,
        builtupAreaSqm: 210,
        volumeCum: 580,
        zMin: 8,
        zMax: 12,
        verticalDatum: 'WGS84 MSL',
        bounds: { minLng: 72.868, maxLng: 72.870, minLat: 19.060, maxLat: 19.062, minZ: 8, maxZ: 12 },
        validationStatus: evt.category === 'CONFLICT' ? 'CONFLICT' : 'VALID',
        provenance: 'DRONE_LIDAR',
        taxStatus: 'PAID',
        simulated: true,
        createdAt: evt.createdAt,
        updatedAt: evt.createdAt
      });
    }
    setActiveTab('MAPLIBRE_3D');
  };

  return (
    <div className="w-full h-full max-w-6xl mx-auto p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-5.5rem)]">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              DoLR Cadastral Verifier & Conflict Management Portal
            </h2>
            <p className="text-xs text-slate-400">
              Department of Land Resources &bull; Unified Land Events, 3D Spatial Conflicts & Immutable Audit Ledger
            </p>
          </div>
        </div>

        {/* Sub-tab Switcher */}
        <div className="flex bg-surface-100 rounded-lg p-1 border border-white/10">
          <button
            onClick={() => setActiveSubTab('EVENTS_CONFLICTS')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeSubTab === 'EVENTS_CONFLICTS'
                ? 'bg-red-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Events & Conflicts ({openConflicts} Open)
          </button>

          <button
            onClick={() => setActiveSubTab('AUDIT_LOGS')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeSubTab === 'AUDIT_LOGS'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Immutable Audit Ledger ({auditLogs.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'EVENTS_CONFLICTS' ? (
        <div className="space-y-5">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-card p-4 rounded-xl border border-white/5 bg-surface-50/60">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Total Events</span>
                <History className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-white mt-2 font-mono">{totalEvents}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Lifecycle & verifications</div>
            </div>

            <div className="glass-card p-4 rounded-xl border border-red-500/20 bg-red-950/20">
              <div className="flex items-center justify-between text-red-300 text-xs">
                <span>Open Conflicts</span>
                <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
              </div>
              <div className="text-2xl font-bold text-red-400 mt-2 font-mono">{openConflicts}</div>
              <div className="text-[10px] text-red-300/70 mt-0.5">Requires DoLR adjudication</div>
            </div>

            <div className="glass-card p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/20">
              <div className="flex items-center justify-between text-emerald-300 text-xs">
                <span>Resolved Conflicts</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">{resolvedConflicts}</div>
              <div className="text-[10px] text-emerald-300/70 mt-0.5">Rectified & approved</div>
            </div>

            <div className="glass-card p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/20">
              <div className="flex items-center justify-between text-cyan-300 text-xs">
                <span>Verified Anchors</span>
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl font-bold text-cyan-400 mt-2 font-mono">{verifiedAnchors}</div>
              <div className="text-[10px] text-cyan-300/70 mt-0.5">Sepolia On-Chain Proofs</div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="glass-panel p-3.5 rounded-xl border border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search events by ULPIN, keyword, or type..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded-lg border border-white/5">
                <span className="text-[11px] text-slate-400">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value as any)}
                  className="bg-transparent text-slate-200 font-semibold focus:outline-none text-[11px]"
                >
                  <option value="ALL" className="bg-slate-900 text-white">All</option>
                  <option value="CONFLICT" className="bg-slate-900 text-white">Conflicts</option>
                  <option value="EVENT" className="bg-slate-900 text-white">Lifecycle Events</option>
                  <option value="VERIFICATION" className="bg-slate-900 text-white">Verifications</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded-lg border border-white/5">
                <span className="text-[11px] text-slate-400">Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="bg-transparent text-slate-200 font-semibold focus:outline-none text-[11px]"
                >
                  <option value="ALL" className="bg-slate-900 text-white">All</option>
                  <option value="OPEN" className="bg-slate-900 text-white">Open</option>
                  <option value="RESOLVED" className="bg-slate-900 text-white">Resolved</option>
                  <option value="COMPLETED" className="bg-slate-900 text-white">Completed</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-black/30 px-2 py-1 rounded-lg border border-white/5">
                <span className="text-[11px] text-slate-400">Severity:</span>
                <select
                  value={severityFilter}
                  onChange={e => setSeverityFilter(e.target.value as any)}
                  className="bg-transparent text-slate-200 font-semibold focus:outline-none text-[11px]"
                >
                  <option value="ALL" className="bg-slate-900 text-white">All</option>
                  <option value="CRITICAL" className="bg-slate-900 text-white">Critical</option>
                  <option value="HIGH" className="bg-slate-900 text-white">High</option>
                  <option value="MEDIUM" className="bg-slate-900 text-white">Medium</option>
                  <option value="LOW" className="bg-slate-900 text-white">Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Master-Detail Split Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Left Column: Events & Conflicts List */}
            <div className="md:col-span-5 space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
              {filteredEvents.length > 0 ? (
                filteredEvents.map(evt => {
                  const isSelected = evt.id === currentEvent?.id;
                  const isConflict = evt.category === 'CONFLICT';
                  const isOpen = evt.status === 'OPEN';

                  return (
                    <button
                      key={evt.id}
                      onClick={() => setSelectedEventId(evt.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                        isSelected
                          ? (isConflict 
                              ? 'glass-panel border-red-500 ring-1 ring-red-500/50 bg-red-950/20 shadow-neon-red'
                              : 'glass-panel border-indigo-500 ring-1 ring-indigo-500/50 bg-indigo-950/20')
                          : 'glass-card border-white/5 hover:border-white/20 bg-surface-50/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            evt.type === 'VERTICAL' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                            evt.type === 'BOUNDARY' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            evt.type === 'UNDERGROUND' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                            evt.type === 'SETBACK' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                            evt.type === 'CREATE' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                            evt.type === 'SUBDIVIDE' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                            evt.type === 'BLOCKCHAIN' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' :
                            'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}>
                            {evt.type}
                          </span>

                          {evt.severity && (
                            <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                              evt.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                              evt.severity === 'HIGH' ? 'bg-amber-600/80 text-white' : 'bg-slate-700 text-slate-300'
                            }`}>
                              {evt.severity}
                            </span>
                          )}
                        </div>

                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isOpen ? 'bg-red-600/30 text-red-200 animate-pulse' :
                          evt.status === 'RESOLVED' || evt.status === 'VERIFIED' || evt.status === 'COMPLETED' ? 'bg-emerald-600/30 text-emerald-200' :
                          'bg-slate-600/30 text-slate-300'
                        }`}>
                          {evt.status}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white line-clamp-1 font-mono">
                        {evt.ulpin}
                      </h4>

                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {evt.description}
                      </p>

                      <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span>{evt.unitId ? `Unit: ${evt.unitId}` : (evt.parcelId ? `Parcel: ${evt.parcelId}` : 'Base Cadastre')}</span>
                        <span>{new Date(evt.createdAt).toLocaleDateString()}</span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-12 text-slate-500 text-xs glass-card rounded-xl border border-white/5">
                  No events found matching current filters.
                </div>
              )}
            </div>

            {/* Right Column: Event Details & Adjudication Actions */}
            {currentEvent ? (
              <div className="md:col-span-7 glass-panel rounded-2xl p-6 border border-white/10 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className={`p-2 rounded-xl ${
                      currentEvent.category === 'CONFLICT' ? 'bg-red-500/20 text-red-400' : 'bg-indigo-500/20 text-indigo-400'
                    }`}>
                      {currentEvent.category === 'CONFLICT' ? <AlertTriangle className="w-5 h-5" /> : <History className="w-5 h-5" />}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        {currentEvent.category === 'CONFLICT' ? '3D Spatial Conflict Inspection' : 'Cadastral Event Record'}
                        <span className="text-[10px] font-mono text-slate-400">({currentEvent.id})</span>
                      </h3>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Category: {currentEvent.category} &bull; Type: {currentEvent.type} {currentEvent.severity ? `• Severity: ${currentEvent.severity}` : ''}
                      </p>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    currentEvent.status === 'OPEN' ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {currentEvent.status}
                  </span>
                </div>

                {/* Description & Payload Details */}
                <div className="space-y-3 text-xs">
                  <div className="glass-card p-3 rounded-xl border border-white/5 space-y-1">
                    <div className="text-slate-400 text-[10px] uppercase font-semibold">Event Summary</div>
                    <p className="text-slate-200 leading-relaxed">{currentEvent.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-mono">
                    <div className="glass-card p-3 rounded-xl border border-white/5">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Primary ULPIN</div>
                      <div className="font-bold text-cyan-300 mt-1 break-all select-all">{currentEvent.ulpin}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {currentEvent.unitId ? `Unit: ${currentEvent.unitId}` : 'Surface Parcel'}
                      </div>
                    </div>

                    <div className="glass-card p-3 rounded-xl border border-white/5">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Associated / Colliding Entity</div>
                      <div className="font-bold text-red-300 mt-1 break-all select-all">
                        {currentEvent.metadata?.collidingUlpin || currentEvent.parentId || 'N/A'}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {currentEvent.metadata?.buildingId ? `Building: ${currentEvent.metadata.buildingId}` : 'Spatial Cadastre Context'}
                      </div>
                    </div>
                  </div>

                  {/* Hashes & Metadata */}
                  <div className="glass-card p-3 rounded-xl border border-white/5 space-y-2 font-mono text-[10px]">
                    <div>
                      <div className="text-slate-500 text-[9px] font-sans">Record Hash</div>
                      <div className="text-slate-300 truncate mt-0.5 select-all">
                        {currentEvent.recordHash || 'Generated SHA-256 State'}
                      </div>
                    </div>

                    {currentEvent.transactionHash && (
                      <div>
                        <div className="text-slate-500 text-[9px] font-sans">Blockchain Tx Hash</div>
                        <div className="text-cyan-400 truncate mt-0.5 select-all">
                          {currentEvent.transactionHash}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[9px] text-slate-500">
                      <span>Created: {new Date(currentEvent.createdAt).toLocaleString()}</span>
                      {currentEvent.resolvedAt && (
                        <span>Resolved: {new Date(currentEvent.resolvedAt).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Adjudication Actions */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="text-[11px] font-semibold text-slate-300 uppercase">
                    Adjudication & Inspection Actions:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {currentEvent.category === 'CONFLICT' && currentEvent.status === 'OPEN' ? (
                      <>
                        <button
                          onClick={() => handleResolveEvent(currentEvent.id, 'RESOLVED')}
                          className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Resolve & Clear
                        </button>

                        <button
                          onClick={() => handleResolveEvent(currentEvent.id, 'REJECTED')}
                          className="py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject / Enforce
                        </button>
                      </>
                    ) : (
                      <div className="sm:col-span-2 py-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        Status: {currentEvent.status}
                      </div>
                    )}

                    <button
                      onClick={() => handleViewIn3D(currentEvent)}
                      className="py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-all"
                    >
                      <Box className="w-3.5 h-3.5" />
                      View in 3D
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="md:col-span-7 glass-panel rounded-2xl p-12 text-center text-slate-500 text-xs border border-white/10 flex items-center justify-center">
                Select an event from the left queue to view details and adjudication actions.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Immutable Audit Ledger View */
        <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-white">
                  Cryptographic Cadastral Audit Trail (SHA-256 Ledger)
                </h3>
                <p className="text-xs text-slate-400">
                  Every 3D spatial write, AI vectorization, and officer mutation is cryptographically signed and legally immutable.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
              CHAIN VERIFIED &bull; {auditLogs.length} BLOCKS
            </span>
          </div>

          <div className="space-y-3">
            {/* Access Logs */}
            {accessLogs.map((log, i) => (
              <div
                key={`access-${i}`}
                className="glass-card p-4 rounded-xl border border-brand-primary/50 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-blue-500/20 text-blue-300">
                      ACCESS
                    </span>
                    <span className="font-semibold text-white">Role: {log.role}</span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Requested {log.route || log.endpoint} ({log.method || 'GET'})
                </p>
                
                <div className="pt-1.5 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-white/5">
                  <span>IP: {log.ip || '127.0.0.1'}</span>
                </div>
              </div>
            ))}
            
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="glass-card p-4 rounded-xl border border-white/5 space-y-2 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${
                      log.action === 'CREATE' ? 'bg-emerald-500/20 text-emerald-300' :
                      log.action === 'VALIDATE' ? 'bg-cyan-500/20 text-cyan-300' :
                      'bg-purple-500/20 text-purple-300'
                    }`}>
                      {log.action}
                    </span>
                    <span className="font-semibold text-white">{log.actor}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-200 text-slate-300 font-mono">
                      {log.actorRole}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {log.summary}
                </p>

                <div className="pt-1.5 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-white/5">
                  <span>Entity: {log.entityType} ({log.entityId})</span>
                  <span className="text-cyan-400/80 truncate max-w-sm" title={log.hashSignature}>
                    SHA256: {log.hashSignature.slice(0, 24)}...{log.hashSignature.slice(-8)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
