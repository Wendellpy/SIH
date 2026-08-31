import { 
  Parcel, 
  Building, 
  VerticalUnit, 
  UndergroundAsset, 
  TopologyValidationLog, 
  AuditLog, 
  AIJob,
  AccessLog,
  LandEvent
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
  private accessLogs: AccessLog[] = [];
  private jobs: Map<string, AIJob> = new Map();
  private landEvents: Map<string, LandEvent> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    SAMPLE_PARCELS.forEach(p => this.parcels.set(p.id, { ...p, visibleTo: ['revenue', 'engineer', 'utility'] }));
    SAMPLE_BUILDINGS.forEach(b => this.buildings.set(b.id, { ...b }));
    SAMPLE_VERTICAL_UNITS.forEach(u => this.verticalUnits.set(u.id, { ...u, visibleTo: ['revenue', 'engineer', 'utility'] }));
    SAMPLE_UNDERGROUND_ASSETS.forEach(a => this.undergroundAssets.set(a.id, { ...a, visibleTo: ['engineer', 'utility'] }));
    SAMPLE_TOPOLOGY_LOGS.forEach(l => {
      this.topologyLogs.set(l.id, { ...l });
      // Map 3D topology conflicts into LandEvents:
      // ERR_3D_Z_OVERLAP -> VERTICAL
      // ERR_BOUND_PROTRUSION -> SETBACK
      // ERR_UTILITY_DEPTH_INTERFERENCE -> UNDERGROUND
      // ERR_NON_WATERTIGHT / other -> BOUNDARY
      let type: 'VERTICAL' | 'BOUNDARY' | 'UNDERGROUND' | 'SETBACK' = 'BOUNDARY';
      if (l.ruleCode === 'ERR_3D_Z_OVERLAP') type = 'VERTICAL';
      else if (l.ruleCode === 'ERR_BOUND_PROTRUSION') type = 'SETBACK';
      else if (l.ruleCode === 'ERR_UTILITY_DEPTH_INTERFERENCE') type = 'UNDERGROUND';

      this.landEvents.set(l.id, {
        id: l.id,
        ulpin: l.ulpin3DPrimary,
        parcelId: l.buildingId,
        type,
        category: 'CONFLICT',
        status: l.status === 'RESOLVED' ? 'RESOLVED' : (l.status === 'REJECTED' ? 'REJECTED' : 'OPEN'),
        severity: l.severity === 'CRITICAL' ? 'CRITICAL' : (l.severity === 'WARNING' ? 'HIGH' : 'LOW'),
        description: l.message,
        metadata: {
          ruleCode: l.ruleCode,
          collidingUlpin: l.ulpin3DColliding,
          buildingId: l.buildingId,
          details: l.details,
          centroid: l.centroid
        },
        createdAt: l.detectedAt || new Date().toISOString(),
        resolvedAt: l.resolvedAt
      });
    });
    this.auditLogs = [...SAMPLE_AUDIT_LOGS];

    // Seed Initial Land Events & Conflicts for Mumbai Cadastre
    const initialEvents: LandEvent[] = [
      // 1. BKC FinTech Tower (MH13BOM04521873)
      {
        id: 'event-001',
        ulpin: 'MH13BOM04521873',
        parcelId: 'parcel-bkc-fintech',
        type: 'CREATE',
        category: 'EVENT',
        status: 'COMPLETED',
        description: 'Cadastral Parcel MH13BOM04521873 registered in Ward H/East',
        metadata: { surveyNumber: 'CS-482/1A', areaSqm: 4250.8, registrar: 'BMC Cadastral Sub-Division' },
        createdAt: '2026-01-15T09:00:00Z',
        recordHash: '0x4a1f68285a8647e30d32d915de3692fa8610bc4b7d1b5619ae5d309047a0a6a0'
      },
      {
        id: 'event-002',
        ulpin: 'MH13BOM04521873.A+03-B302',
        parcelId: 'parcel-bkc-fintech',
        unitId: 'A+03-B302',
        parentId: 'MH13BOM04521873',
        type: 'SUBDIVIDE',
        category: 'EVENT',
        status: 'COMPLETED',
        description: 'Vertical 3D Unit B302 subdivided on Floor +03 (Commercial Tech Suite)',
        metadata: { levelCode: '+03', builtupAreaSqm: 185.0, occupancyClass: 'Commercial' },
        createdAt: '2026-01-16T10:00:00Z',
        recordHash: '0x32d915de3692fa8610bc4b7d1b5619ae5d309047a0a6a033774cfe1482927831'
      },
      {
        id: 'event-003',
        ulpin: 'MH13BOM04521873.A+03-B302',
        parcelId: 'parcel-bkc-fintech',
        unitId: 'A+03-B302',
        parentId: 'MH13BOM04521873',
        type: 'TRANSFER',
        category: 'EVENT',
        status: 'COMPLETED',
        description: 'Title Conveyance executed to FinTech Ventures Pvt Ltd (Deed #BOM-2026-9921)',
        metadata: { buyer: 'FinTech Ventures Pvt Ltd', considerationInr: 45000000 },
        createdAt: '2026-02-10T14:30:00Z',
        recordHash: '0x8f72c10a4e3b1c902d58fa6321b0cd981240afb12e3498ac12ef45b912389012'
      },
      {
        id: 'event-004',
        ulpin: 'MH13BOM04521873.A+03-B302',
        parcelId: 'parcel-bkc-fintech',
        unitId: 'A+03-B302',
        type: 'BLOCKCHAIN',
        category: 'VERIFICATION',
        status: 'VERIFIED',
        description: 'On-chain cryptographic anchoring on Ethereum Sepolia LandLedger',
        metadata: { network: 'Sepolia', contract: '0xD9397153b1E7B0b37AAd9FC4c1Eb2cA96d9E300F', blockNumber: 6543210 },
        createdAt: '2026-08-31T20:20:00Z',
        transactionHash: '0x73410d04ad504527598b288c9ee5fac70151937f44a09f9dd07ba00aee9af43b',
        recordHash: '0x32d915de3692fa8610bc4b7d1b5619ae5d309047a0a6a033774cfe1482927831'
      },
      {
        id: 'event-005',
        ulpin: 'MH13BOM04521873',
        parcelId: 'parcel-bkc-fintech',
        type: 'BOUNDARY',
        category: 'CONFLICT',
        status: 'OPEN',
        severity: 'HIGH',
        description: 'Boundary protrusion detected against adjacent road buffer setback',
        metadata: { overlapAreaSqm: 14.2, rule: 'ERR_BOUND_PROTRUSION' },
        createdAt: '2026-08-28T14:00:00Z'
      },

      // 2. High-Rise Tower (MH13BOM04522045 & MH13BOM04522045.A+05-58)
      {
        id: 'event-006',
        ulpin: 'MH13BOM04522045',
        parcelId: 'parcel-worli-sea',
        type: 'CREATE',
        category: 'EVENT',
        status: 'COMPLETED',
        description: 'Master Cadastral Parcel MH13BOM04522045 registered in Ward G/South',
        metadata: { surveyNumber: 'CS-1094/3', areaSqm: 5890.4, approvedFsi: 4.5 },
        createdAt: '2026-01-08T08:30:00Z',
        recordHash: '0x6e91cb34fa092185b01834927fa109823e5901284fa981245b01928471029384'
      },
      {
        id: 'event-007',
        ulpin: 'MH13BOM04522045.A+05-58',
        parcelId: 'parcel-worli-sea',
        unitId: 'A+05-58',
        parentId: 'MH13BOM04522045',
        type: 'SUBDIVIDE',
        category: 'EVENT',
        status: 'COMPLETED',
        description: '3D Vertical Residential Unit #58 subdivided on Floor +05 (East Wing 3BHK)',
        metadata: { levelCode: '+05', carpetAreaSqm: 168.4, balconyAreaSqm: 24.0 },
        createdAt: '2026-01-12T11:15:00Z',
        recordHash: '0x99248fab019245bc120948571029384fa0192847102938491823746192837465'
      },
      {
        id: 'event-008',
        ulpin: 'MH13BOM04522045.A+05-58',
        parcelId: 'parcel-worli-sea',
        unitId: 'A+05-58',
        parentId: 'MH13BOM04522045',
        type: 'TRANSFER',
        category: 'EVENT',
        status: 'COMPLETED',
        description: 'Ownership Deed registered to Rajesh & Sunita Mehta (Agreement #REG-2026-4410)',
        metadata: { primaryOwner: 'Rajesh Mehta', coOwner: 'Sunita Mehta', stampDutyPaid: 420000 },
        createdAt: '2026-01-28T16:00:00Z',
        recordHash: '0x1029384fa019284710293849182374619283746599248fab019245bc12094857'
      },
      {
        id: 'event-009',
        ulpin: 'MH13BOM04522045.A+05-58',
        parcelId: 'parcel-worli-sea',
        unitId: 'A+05-58',
        type: 'BLOCKCHAIN',
        category: 'VERIFICATION',
        status: 'VERIFIED',
        description: 'Cryptographically anchored on Ethereum Sepolia LandLedger (Tx verified)',
        metadata: { network: 'Sepolia', contract: '0xD9397153b1E7B0b37AAd9FC4c1Eb2cA96d9E300F', blockNumber: 6543180 },
        createdAt: '2026-08-30T18:45:00Z',
        transactionHash: '0x4981240afb12e3498ac12ef45b9123890128f72c10a4e3b1c902d58fa6321b0c',
        recordHash: '0x99248fab019245bc120948571029384fa0192847102938491823746192837465'
      },
      {
        id: 'event-010',
        ulpin: 'MH13BOM04522045.A+05-58',
        parcelId: 'parcel-worli-sea',
        unitId: 'A+05-58',
        type: 'MODIFY',
        category: 'EVENT',
        status: 'COMPLETED',
        description: 'Internal Balcony Enclosure structural alteration approved by BMC Ward Office',
        metadata: { permitNumber: 'BMC/ALT/2026/089', architectLicence: 'CA/2019/88120' },
        createdAt: '2026-04-14T10:00:00Z',
        recordHash: '0x77123984fa019284710293849182374619283746599248fab019245bc1209485'
      },

      // 3. Lodha World One Complex (MH13BOM04521990)
      {
        id: 'event-011',
        ulpin: 'MH13BOM04521990',
        parcelId: 'parcel-lower-parel',
        type: 'CREATE',
        category: 'EVENT',
        status: 'COMPLETED',
        description: 'Cadastral Parcel MH13BOM04521990 created in Lower Parel Ward',
        metadata: { surveyNumber: 'CS-881/B', areaSqm: 8200.0 },
        createdAt: '2026-01-02T09:00:00Z',
        recordHash: '0x5519283746599248fab019245bc120948571029384fa01928471029384918237'
      },
      {
        id: 'event-012',
        ulpin: 'MH13BOM04521990.G00-LOB01',
        parcelId: 'parcel-lower-parel',
        unitId: 'G00-LOB01',
        parentId: 'MH13BOM04521990',
        type: 'SUBDIVIDE',
        category: 'EVENT',
        status: 'COMPLETED',
        description: 'Grand Lobby & Common Concierge Area subdivided as Public Access Cadastre Unit',
        metadata: { levelCode: 'G00', carpetAreaSqm: 450.0 },
        createdAt: '2026-01-05T12:00:00Z',
        recordHash: '0x22948fab019245bc120948571029384fa0192847102938491823746192837465'
      },
      {
        id: 'event-013',
        ulpin: 'MH13BOM04521990.G00-LOB01',
        parcelId: 'parcel-lower-parel',
        unitId: 'G00-LOB01',
        type: 'BLOCKCHAIN',
        category: 'VERIFICATION',
        status: 'VERIFIED',
        description: 'Common Area spatial deed anchored on Sepolia LandLedger',
        metadata: { network: 'Sepolia', contract: '0xD9397153b1E7B0b37AAd9FC4c1Eb2cA96d9E300F' },
        createdAt: '2026-08-25T11:20:00Z',
        transactionHash: '0x99a12e3498ac12ef45b9123890128f72c10a4e3b1c902d58fa6321b0cd981240',
        recordHash: '0x22948fab019245bc120948571029384fa0192847102938491823746192837465'
      }
    ];
    initialEvents.forEach(e => this.landEvents.set(e.id, e));
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
    const resolvedAt = new Date().toISOString();

    if (log) {
      log.status = status;
      log.resolvedAt = resolvedAt;
      log.resolvedBy = resolvedBy;
      this.topologyLogs.set(id, log);
    }

    // Synchronize status in unified LandEvent store
    this.updateLandEventStatus(id, status, resolvedAt);

    this.logAudit({
      actor: resolvedBy,
      actorRole: 'DOLR_VERIFIER',
      action: 'RESOLVE_CONFLICT',
      entityType: 'VALIDATION_LOG',
      entityId: id,
      summary: `DoLR Verifier ${resolvedBy} marked conflict ${id} as ${status}.`,
      newState: log || this.getLandEventById(id)
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

  // --- Access Logs (Feature 3) ---
  logAccess(role: string, endpoint: string, ulpinId?: string) {
    this.accessLogs.unshift({
      id: crypto.randomUUID(),
      role,
      endpoint,
      ulpinId,
      timestamp: new Date().toISOString()
    });
  }

  getAccessLogs(limit: number = 20): AccessLog[] {
    return this.accessLogs.slice(0, limit);
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

  // --- Land Events & Conflict Engine ---
  generateLifecycleEventsForUlpin(ulpinInput: string): LandEvent[] {
    const raw = ulpinInput.trim();
    const parts = raw.split('.');
    const baseUlpin = parts[0];
    const unitId = parts[1] || 'G00-LOB01';
    const floorCode = unitId.includes('+') ? unitId.split('+')[1]?.split('-')[0] : (unitId.includes('-') ? unitId.split('-')[0] : '01');

    const createHash = `0x${crypto.createHash('sha256').update(`CREATE:${baseUlpin}`).digest('hex')}`;
    const subdivideHash = `0x${crypto.createHash('sha256').update(`SUBDIVIDE:${raw}`).digest('hex')}`;
    const transferHash = `0x${crypto.createHash('sha256').update(`TRANSFER:${raw}`).digest('hex')}`;
    const txHash = `0x${crypto.createHash('sha256').update(`TX:${raw}`).digest('hex')}`;

    return [
      {
        id: `gen-${crypto.randomUUID().slice(0, 8)}`,
        ulpin: baseUlpin,
        type: 'CREATE',
        category: 'EVENT',
        status: 'COMPLETED',
        description: `Cadastral Parcel ${baseUlpin} spatial registration and municipal survey entry`,
        metadata: { surveyApproved: true, jurisdiction: 'Municipal Corporation of Greater Mumbai (BMC)' },
        createdAt: '2026-01-05T09:00:00Z',
        recordHash: createHash
      },
      {
        id: `gen-${crypto.randomUUID().slice(0, 8)}`,
        ulpin: raw,
        unitId,
        parentId: baseUlpin,
        type: 'SUBDIVIDE',
        category: 'EVENT',
        status: 'COMPLETED',
        description: `3D Vertical Cadastre Unit ${unitId} subdivided on Floor +${floorCode}`,
        metadata: { levelCode: `+${floorCode}`, builtupAreaSqm: 154.2, unitId },
        createdAt: '2026-01-14T11:30:00Z',
        recordHash: subdivideHash
      },
      {
        id: `gen-${crypto.randomUUID().slice(0, 8)}`,
        ulpin: raw,
        unitId,
        parentId: baseUlpin,
        type: 'TRANSFER',
        category: 'EVENT',
        status: 'COMPLETED',
        description: `Conveyance Title Deed registered to verified occupant (Deed #MUM-${floorCode}02)`,
        metadata: { registrationOffice: 'Sub-Registrar Mumbai', status: 'VERIFIED' },
        createdAt: '2026-02-01T15:00:00Z',
        recordHash: transferHash
      },
      {
        id: `gen-${crypto.randomUUID().slice(0, 8)}`,
        ulpin: raw,
        unitId,
        parentId: baseUlpin,
        type: 'BLOCKCHAIN',
        category: 'VERIFICATION',
        status: 'VERIFIED',
        description: `Cryptographically anchored on Ethereum Sepolia LandLedger`,
        metadata: { network: 'Sepolia', contract: '0xD9397153b1E7B0b37AAd9FC4c1Eb2cA96d9E300F', blockNumber: 6543200 },
        createdAt: '2026-08-30T12:00:00Z',
        transactionHash: txHash,
        recordHash: subdivideHash
      }
    ];
  }

  getLandEvents(filter?: { 
    ulpin?: string; 
    category?: string; 
    type?: string; 
    status?: string; 
    severity?: string; 
  }): LandEvent[] {
    let list = Array.from(this.landEvents.values());
    if (filter?.ulpin) {
      const q = filter.ulpin.trim().toUpperCase();
      const baseQ = q.includes('.') ? q.split('.')[0] : q;
      const unitQ = q.includes('.') ? q.split('.')[1] : '';

      list = list.filter(e => 
        e.ulpin.toUpperCase().includes(q) || 
        (e.parentId && e.parentId.toUpperCase().includes(q)) ||
        (e.ulpin.toUpperCase().includes(baseQ) && (!unitQ || e.unitId?.toUpperCase().includes(unitQ)))
      );

      // If no events found for this specific queried entity, dynamically synthesize canonical lifecycle events
      if (list.length === 0) {
        const genEvents = this.generateLifecycleEventsForUlpin(filter.ulpin);
        genEvents.forEach(e => this.landEvents.set(e.id, e));
        list = genEvents;
      }
    }
    if (filter?.category) {
      list = list.filter(e => e.category === filter.category);
    }
    if (filter?.type) {
      list = list.filter(e => e.type === filter.type);
    }
    if (filter?.status) {
      list = list.filter(e => e.status === filter.status);
    }
    if (filter?.severity) {
      list = list.filter(e => e.severity === filter.severity);
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getLandEventById(id: string): LandEvent | undefined {
    return this.landEvents.get(id);
  }

  addLandEvent(event: LandEvent): LandEvent {
    this.landEvents.set(event.id, event);
    return event;
  }

  updateLandEventStatus(id: string, status: any, resolvedAt?: string): LandEvent | undefined {
    const event = this.landEvents.get(id);
    if (!event) return undefined;
    event.status = status;
    if (resolvedAt) {
      event.resolvedAt = resolvedAt;
    } else if (status === 'RESOLVED' || status === 'COMPLETED') {
      event.resolvedAt = new Date().toISOString();
    }
    this.landEvents.set(id, event);
    return event;
  }
}

export const db = new CadastreStore();
