import crypto from 'crypto';
import { 
  LandEvent, 
  LandActionType, 
  LandConflictType, 
  LandVerificationType, 
  LandEventSeverity, 
  LandEventStatus,
  ConflictRuleCode,
  TopologyValidationLog
} from '@sih/shared-types';
import { db } from '../database/store.js';

export interface CreateEventParams {
  ulpin: string;
  type: LandActionType;
  parcelId?: string;
  unitId?: string;
  parentId?: string;
  description: string;
  metadata?: Record<string, any>;
  recordHash?: string;
  status?: LandEventStatus;
}

export interface CreateConflictParams {
  id?: string;
  ulpin: string;
  type: LandConflictType;
  parcelId?: string;
  unitId?: string;
  parentId?: string;
  severity?: LandEventSeverity;
  description: string;
  metadata?: Record<string, any>;
}

export interface CreateVerificationParams {
  ulpin: string;
  type: LandVerificationType;
  parcelId?: string;
  unitId?: string;
  status?: LandEventStatus;
  description: string;
  transactionHash?: string;
  recordHash?: string;
  metadata?: Record<string, any>;
}

export class LandEventService {
  /**
   * Deterministically computes a SHA-256 hash for record integrity
   */
  private generateRecordHash(ulpin: string, unitId?: string, payload?: any): string {
    const key = `${ulpin}#${unitId || ''}#${payload ? JSON.stringify(payload) : ''}`;
    return `0x${crypto.createHash('sha256').update(key).digest('hex')}`;
  }

  /**
   * 1. Create a core land lifecycle event (CREATE, SUBDIVIDE, TRANSFER, MODIFY)
   */
  public createEvent(params: CreateEventParams): LandEvent {
    const id = `event-${crypto.randomUUID().slice(0, 8)}`;
    const recordHash = params.recordHash || this.generateRecordHash(params.ulpin, params.unitId, params.metadata);

    const event: LandEvent = {
      id,
      ulpin: params.ulpin,
      parcelId: params.parcelId,
      unitId: params.unitId,
      parentId: params.parentId,
      type: params.type,
      category: 'EVENT',
      status: params.status || 'COMPLETED',
      description: params.description,
      metadata: params.metadata || {},
      createdAt: new Date().toISOString(),
      recordHash
    };

    db.addLandEvent(event);

    db.logAudit({
      actor: 'SYSTEM_ENGINE',
      actorRole: 'DOLR_VERIFIER',
      action: params.type === 'CREATE' ? 'CREATE' : 'UPDATE',
      entityType: params.unitId ? 'VERTICAL_UNIT' : 'PARCEL',
      entityId: params.ulpin,
      summary: `[LandEvent: ${params.type}] ${params.description}`,
      newState: event
    });

    return event;
  }

  /**
   * 2. Create a spatial or legal conflict event (BOUNDARY, VERTICAL, UNDERGROUND, SETBACK)
   */
  public createConflict(params: CreateConflictParams): LandEvent {
    const id = params.id || `conflict-${crypto.randomUUID().slice(0, 8)}`;

    const event: LandEvent = {
      id,
      ulpin: params.ulpin,
      parcelId: params.parcelId,
      unitId: params.unitId,
      parentId: params.parentId,
      type: params.type,
      category: 'CONFLICT',
      status: 'OPEN',
      severity: params.severity || 'HIGH',
      description: params.description,
      metadata: params.metadata || {},
      createdAt: new Date().toISOString()
    };

    db.addLandEvent(event);

    db.logAudit({
      actor: 'CONFLICT_ENGINE',
      actorRole: 'SYSTEM_AI',
      action: 'VALIDATE',
      entityType: 'VALIDATION_LOG',
      entityId: id,
      summary: `[Conflict: ${params.type}] ${params.description} (Severity: ${event.severity})`,
      newState: event
    });

    return event;
  }

  /**
   * Map legacy/topology conflict rule codes into standardized LandConflictTypes:
   * - 3D overlap -> VERTICAL
   * - parcel geometry overlap -> BOUNDARY
   * - utility intersection -> UNDERGROUND
   * - clearance/setback failure -> SETBACK
   */
  public mapRuleCodeToConflictType(ruleCode: ConflictRuleCode): LandConflictType {
    switch (ruleCode) {
      case 'ERR_3D_Z_OVERLAP':
        return 'VERTICAL';
      case 'ERR_UTILITY_DEPTH_INTERFERENCE':
        return 'UNDERGROUND';
      case 'ERR_BOUND_PROTRUSION':
        return 'SETBACK';
      case 'ERR_NON_WATERTIGHT':
      case 'ERR_UNMAPPED_VOLUME':
      default:
        return 'BOUNDARY';
    }
  }

  /**
   * Ingest a 3D topology / collision detection result into a unified LandEvent
   */
  public ingestTopologyConflict(log: TopologyValidationLog): LandEvent {
    const conflictType = this.mapRuleCodeToConflictType(log.ruleCode);
    const severityMap: Record<string, LandEventSeverity> = {
      CRITICAL: 'CRITICAL',
      WARNING: 'HIGH',
      INFO: 'LOW'
    };

    const event: LandEvent = {
      id: log.id,
      ulpin: log.ulpin3DPrimary,
      parcelId: log.buildingId,
      type: conflictType,
      category: 'CONFLICT',
      status: log.status === 'RESOLVED' ? 'RESOLVED' : (log.status === 'REJECTED' ? 'REJECTED' : 'OPEN'),
      severity: severityMap[log.severity] || 'HIGH',
      description: log.message,
      metadata: {
        ruleCode: log.ruleCode,
        collidingUlpin: log.ulpin3DColliding,
        buildingId: log.buildingId,
        details: log.details,
        centroid: log.centroid
      },
      createdAt: log.detectedAt || new Date().toISOString(),
      resolvedAt: log.resolvedAt
    };

    db.addLandEvent(event);
    return event;
  }

  /**
   * Ingest an underground utility intersection conflict
   */
  public ingestUtilityClearanceConflict(params: {
    ulpin: string;
    utilityId: string;
    utilityType: string;
    distance: number;
    severity: string;
    footprint?: any;
  }): LandEvent {
    const severityMap: Record<string, LandEventSeverity> = {
      high: 'HIGH',
      medium: 'MEDIUM',
      low: 'LOW',
      critical: 'CRITICAL'
    };

    return this.createConflict({
      ulpin: params.ulpin,
      type: 'UNDERGROUND',
      severity: severityMap[params.severity.toLowerCase()] || 'HIGH',
      description: `Underground utility interference detected with ${params.utilityType} (ID: ${params.utilityId}, Clearance Distance: ${params.distance.toFixed(2)}m)`,
      metadata: {
        utilityId: params.utilityId,
        utilityType: params.utilityType,
        distance: params.distance,
        footprint: params.footprint
      }
    });
  }

  /**
   * Ingest a surface parcel boundary / setback overlap conflict
   */
  public ingestParcelBoundaryOverlap(params: {
    ulpinPrimary: string;
    ulpinColliding?: string;
    overlapAreaSqm: number;
    isSetback?: boolean;
    description?: string;
  }): LandEvent {
    const type: LandConflictType = params.isSetback ? 'SETBACK' : 'BOUNDARY';
    return this.createConflict({
      ulpin: params.ulpinPrimary,
      type,
      severity: params.overlapAreaSqm > 50 ? 'CRITICAL' : 'HIGH',
      description: params.description || `${type === 'SETBACK' ? 'Setback buffer clearance failure' : 'Parcel boundary overlap'} detected on ${params.ulpinPrimary} (${params.overlapAreaSqm.toFixed(1)} m²)`,
      metadata: {
        collidingUlpin: params.ulpinColliding,
        overlapAreaSqm: params.overlapAreaSqm
      }
    });
  }

  /**
   * 3. Resolve an open conflict event
   */
  public resolveConflict(
    id: string, 
    resolvedBy: string, 
    status: 'RESOLVED' | 'REJECTED' = 'RESOLVED',
    notes?: string
  ): LandEvent | null {
    const existing = db.getLandEventById(id);
    if (!existing || existing.category !== 'CONFLICT') {
      return null;
    }

    const resolvedAt = new Date().toISOString();
    const updated = db.updateLandEventStatus(id, status, resolvedAt);

    if (updated) {
      if (notes) {
        updated.metadata = { ...updated.metadata, resolutionNotes: notes, resolvedBy };
      }
      db.logAudit({
        actor: resolvedBy,
        actorRole: 'DOLR_VERIFIER',
        action: 'RESOLVE_CONFLICT',
        entityType: 'VALIDATION_LOG',
        entityId: id,
        summary: `Conflict ${id} marked as ${status} by ${resolvedBy}. ${notes ? `Notes: ${notes}` : ''}`,
        newState: updated
      });
    }

    return updated || null;
  }

  /**
   * 4. Create a verification or audit anchoring event (HASH, BLOCKCHAIN, AUDIT)
   */
  public createVerificationEvent(params: CreateVerificationParams): LandEvent {
    const id = `verify-${crypto.randomUUID().slice(0, 8)}`;
    const recordHash = params.recordHash || this.generateRecordHash(params.ulpin, params.unitId, params.metadata);

    const event: LandEvent = {
      id,
      ulpin: params.ulpin,
      parcelId: params.parcelId,
      unitId: params.unitId,
      type: params.type,
      category: 'VERIFICATION',
      status: params.status || 'VERIFIED',
      description: params.description,
      metadata: params.metadata || {},
      createdAt: new Date().toISOString(),
      transactionHash: params.transactionHash,
      recordHash
    };

    db.addLandEvent(event);
    return event;
  }

  /**
   * 5. Get all events for a specific parcel
   */
  public getEventsForParcel(parcelId: string): LandEvent[] {
    const parcel = db.getParcelById(parcelId) || db.getParcelByUlpin(parcelId);
    const targetUlpin = parcel ? parcel.ulpin : parcelId;
    
    return db.getLandEvents().filter(
      e => e.parcelId === parcelId || e.ulpin.toUpperCase().startsWith(targetUlpin.toUpperCase())
    );
  }

  /**
   * 6. Get all events for a specific ULPIN (2D parcel or 3D unit)
   */
  public getEventsForUlpin(ulpin: string): LandEvent[] {
    return db.getLandEvents({ ulpin });
  }
}

export const landEventService = new LandEventService();
