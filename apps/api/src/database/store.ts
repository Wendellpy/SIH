import { 
  Parcel, 
  Building, 
  VerticalUnit, 
  UndergroundAsset, 
  TopologyValidationLog, 
  AuditLog, 
  AIJob 
} from '@sih/shared-types';
import { 
  SAMPLE_PARCELS, 
  SAMPLE_BUILDINGS, 
  SAMPLE_VERTICAL_UNITS, 
  SAMPLE_UNDERGROUND_ASSETS, 
  SAMPLE_TOPOLOGY_LOGS, 
  SAMPLE_AUDIT_LOGS 
} from '@sih/sample-data';
import crypto from 'crypto';

/**
 * Cadastral Data Store (PostGIS Compatible Memory Model)
 */
export class CadastreStore {
  private parcels: Map<string, Parcel> = new Map();
  private buildings: Map<string, Building> = new Map();
  private verticalUnits: Map<string, VerticalUnit> = new Map();
  private undergroundAssets: Map<string, UndergroundAsset> = new Map();
  private topologyLogs: Map<string, TopologyValidationLog> = new Map();
  private auditLogs: AuditLog[] = [];
  private jobs: Map<string, AIJob> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    SAMPLE_PARCELS.forEach(p => this.parcels.set(p.id, { ...p }));
    SAMPLE_BUILDINGS.forEach(b => this.buildings.set(b.id, { ...b }));
    SAMPLE_VERTICAL_UNITS.forEach(u => this.verticalUnits.set(u.id, { ...u }));
    SAMPLE_UNDERGROUND_ASSETS.forEach(a => this.undergroundAssets.set(a.id, { ...a }));
    SAMPLE_TOPOLOGY_LOGS.forEach(l => this.topologyLogs.set(l.id, { ...l }));
    this.auditLogs = [...SAMPLE_AUDIT_LOGS];
  }

  // --- Parcel Operations ---
  getParcels(): Parcel[] {
    return Array.from(this.parcels.values());
  }

  getParcelByUlpin(baseUlpin: string): Parcel | undefined {
    return Array.from(this.parcels.values()).find(
      p => p.ulpin.toUpperCase() === baseUlpin.trim().toUpperCase()
    );
  }

  getParcelById(id: string): Parcel | undefined {
    return this.parcels.get(id);
  }

  // --- Building Operations ---
  getBuildings(): Building[] {
    return Array.from(this.buildings.values());
  }

  getBuildingsByParcelId(parcelId: string): Building[] {
    return Array.from(this.buildings.values()).filter(b => b.parcelId === parcelId);
  }

  getBuildingById(id: string): Building | undefined {
    return this.buildings.get(id);
  }

  // --- Vertical Unit Operations ---
  getVerticalUnits(buildingId?: string): VerticalUnit[] {
    const all = Array.from(this.verticalUnits.values());
    if (buildingId) {
      return all.filter(u => u.buildingId === buildingId);
    }
    return all;
  }

  getVerticalUnitBy3DUlpin(ulpin3D: string): VerticalUnit | undefined {
    return Array.from(this.verticalUnits.values()).find(
      u => u.ulpin3D.toUpperCase() === ulpin3D.trim().toUpperCase()
    );
  }

  addVerticalUnit(unit: VerticalUnit, actor = 'SYSTEM_AI') {
    this.verticalUnits.set(unit.id, unit);
    this.logAudit({
      actor,
      actorRole: 'SYSTEM_AI',
      action: 'CREATE',
      entityType: 'VERTICAL_UNIT',
      entityId: unit.ulpin3D,
      summary: `Created 3D Vertical Unit ${unit.ulpin3D} (Level ${unit.levelCode}, Floor ${unit.floorNumber})`,
      newState: unit
    });
  }

  // --- Underground Asset Operations ---
  getUndergroundAssets(parcelId?: string): UndergroundAsset[] {
    const all = Array.from(this.undergroundAssets.values());
    if (parcelId) {
      return all.filter(a => a.parcelId === parcelId);
    }
    return all;
  }

  // --- Topology Conflicts ---
  getTopologyLogs(): TopologyValidationLog[] {
    return Array.from(this.topologyLogs.values());
  }

  getTopologyLogById(id: string): TopologyValidationLog | undefined {
    return this.topologyLogs.get(id);
  }

  resolveConflict(id: string, resolvedBy: string, status: 'RESOLVED' | 'REJECTED' = 'RESOLVED'): boolean {
    const log = this.topologyLogs.get(id);
    if (!log) return false;
    log.status = status;
    log.resolvedAt = new Date().toISOString();
    log.resolvedBy = resolvedBy;
    this.topologyLogs.set(id, log);

    this.logAudit({
      actor: resolvedBy,
      actorRole: 'DOLR_VERIFIER',
      action: 'RESOLVE_CONFLICT',
      entityType: 'VALIDATION_LOG',
      entityId: id,
      summary: `DoLR Verifier ${resolvedBy} marked conflict ${id} as ${status}.`,
      newState: log
    });
    return true;
  }

  // --- AI Jobs ---
  getJob(id: string): AIJob | undefined {
    return this.jobs.get(id);
  }

  saveJob(job: AIJob) {
    this.jobs.set(job.id, job);
  }

  // --- Immutable Audit Ledger ---
  getAuditLogs(): AuditLog[] {
    return [...this.auditLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  logAudit(entry: Omit<AuditLog, 'id' | 'timestamp' | 'hashSignature'>): AuditLog {
    const timestamp = new Date().toISOString();
    const id = `audit-${crypto.randomUUID().slice(0, 8)}`;
    const payload = JSON.stringify({ id, timestamp, ...entry });
    const hashSignature = crypto.createHash('sha256').update(payload).digest('hex');

    const log: AuditLog = {
      id,
      timestamp,
      ...entry,
      hashSignature
    };
    this.auditLogs.unshift(log);
    return log;
  }
}

export const db = new CadastreStore();
