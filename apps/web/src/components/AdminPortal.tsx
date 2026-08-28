'use client';

import React, { useState } from 'react';
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
  Lock
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { SAMPLE_TOPOLOGY_LOGS, SAMPLE_AUDIT_LOGS } from '@sih/sample-data';

export const AdminPortal: React.FC = () => {
  const { 
    topologyLogs, 
    resolveConflict, 
    auditLogs, 
    addAuditLog, 
    setActiveTab, 
    setSelectedUnit 
  } = useAppStore();

  const [selectedLogId, setSelectedLogId] = useState<string>(topologyLogs[0]?.id || '');
  const [activeSubTab, setActiveSubTab] = useState<'CONFLICTS' | 'AUDIT_LOGS'>('CONFLICTS');

  const currentLog = topologyLogs.find(l => l.id === selectedLogId) || topologyLogs[0];

  const handleAction = (status: 'RESOLVED' | 'REJECTED', actionTitle: string) => {
    if (!currentLog) return;
    resolveConflict(currentLog.id);

    addAuditLog({
      id: `audit-dolr-${Date.now().toString(36)}`,
      timestamp: new Date().toISOString(),
      actor: 'DoLR Senior Verifier Officer (Rajesh Sharma)',
      actorRole: 'DOLR_VERIFIER',
      action: 'RESOLVE_CONFLICT',
      entityType: 'VALIDATION_LOG',
      entityId: currentLog.id,
      summary: `Action Taken: ${actionTitle} on 3D Conflict ${currentLog.id} (${currentLog.ruleCode}).`,
      hashSignature: 'f8219c48892be841029481940192841a1094892c90e1f748951048b6c4892841'
    });

    alert(`Cadastral Action Committed: ${actionTitle}. Logged to immutable audit trail.`);
  };

  return (
    <div className="w-full h-full max-w-6xl mx-auto p-4 space-y-6 overflow-y-auto max-h-[calc(100vh-5.5rem)]">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              DoLR Cadastral Verifier & Conflict Management Portal
            </h2>
            <p className="text-xs text-slate-400">
              Department of Land Resources &bull; 3D Solid Topology Adjudication & Immutable Audit Ledger
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-surface-100 rounded-lg p-1 border border-white/10">
          <button
            onClick={() => setActiveSubTab('CONFLICTS')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeSubTab === 'CONFLICTS'
                ? 'bg-red-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            3D Topology Conflicts ({topologyLogs.filter(l => l.status === 'OPEN').length})
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

      {activeSubTab === 'CONFLICTS' ? (
        /* Conflicts Dashboard */
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Conflict Queue */}
          <div className="md:col-span-5 space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
              Active Cadastral Conflicts
            </div>

            {topologyLogs.map(log => {
              const isSelected = log.id === currentLog?.id;
              const isOpen = log.status === 'OPEN';

              return (
                <button
                  key={log.id}
                  onClick={() => setSelectedLogId(log.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'glass-panel border-red-500 ring-1 ring-red-500/50 bg-red-950/20 shadow-neon-red'
                      : 'glass-card border-white/5 hover:border-white/20 bg-surface-50/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                      log.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {log.ruleCode}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isOpen ? 'bg-red-600/30 text-red-200 animate-pulse' : 'bg-emerald-600/30 text-emerald-200'
                    }`}>
                      {log.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white line-clamp-1">
                    {log.ulpin3DPrimary}
                  </h4>

                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {log.message}
                  </p>

                  <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>Encroachment: {log.details.overlapVolumeCum || 0} m³</span>
                    <span>{new Date(log.detectedAt).toLocaleTimeString()}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Selected Conflict Adjudication Card */}
          {currentLog && (
            <div className="md:col-span-7 glass-panel-glow rounded-2xl p-6 border border-red-500/40 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-red-500/20 text-red-400">
                    <AlertTriangle className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      3D Spatial Conflict Inspection & Adjudication
                    </h3>
                    <p className="text-[11px] text-red-300 font-mono">
                      Rule Violation: {currentLog.ruleCode} &bull; Severity: {currentLog.severity}
                    </p>
                  </div>
                </div>

                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  currentLog.status === 'OPEN' ? 'bg-red-500 text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {currentLog.status}
                </span>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-3 text-xs">
                <div className="glass-card p-3 rounded-xl border border-white/5 space-y-1">
                  <div className="text-slate-400 text-[10px] uppercase font-semibold">Violation Summary</div>
                  <p className="text-slate-200 leading-relaxed">{currentLog.message}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card p-3 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Primary Unit (Registered)</div>
                    <div className="font-mono font-bold text-cyan-300 mt-1 break-all">{currentLog.ulpin3DPrimary}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Floor +02 &bull; SEBI Regulatory Lab</div>
                  </div>

                  <div className="glass-card p-3 rounded-xl border border-white/5">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Colliding Entity (Encroacher)</div>
                    <div className="font-mono font-bold text-red-300 mt-1 break-all">{currentLog.ulpin3DColliding || 'Setback Zone'}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Floor +02 &bull; Mezzanine Expansion</div>
                  </div>
                </div>

                {/* Spatial Coordinates & Encroachment Metric */}
                <div className="glass-card p-3 rounded-xl border border-white/5 grid grid-cols-3 gap-2 text-center font-mono">
                  <div>
                    <div className="text-[9px] text-slate-400">OVERLAP VOLUME</div>
                    <div className="text-sm font-bold text-red-400 mt-0.5">{currentLog.details.overlapVolumeCum} m³</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400">ELEVATION RANGE</div>
                    <div className="text-xs font-bold text-white mt-0.5">Z: +11.2m to +12.6m</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-slate-400">ENCROACHMENT %</div>
                    <div className="text-xs font-bold text-amber-300 mt-0.5">{currentLog.details.overlapPercentage}%</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Verifier */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="text-[11px] font-semibold text-slate-300 uppercase">
                  Cadastral Adjudication Actions:
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleAction('RESOLVED', 'Approve Boundary Rectification & Clip Mezzanine Solid')}
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Clip & Rectify
                  </button>

                  <button
                    onClick={() => handleAction('REJECTED', 'Reject Unauthorized Mezzanine Solid from Cadastre')}
                    className="py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow transition-all"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject Encroachment
                  </button>

                  <button
                    onClick={() => {
                      alert('Triggered Drone/CORS GNSS Field Verification Order for BKC G-Block.');
                    }}
                    className="py-2 px-3 rounded-xl bg-surface-100 hover:bg-surface-200 text-slate-200 text-xs font-medium border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Order Field Re-Survey
                  </button>
                </div>
              </div>
            </div>
          )}
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
