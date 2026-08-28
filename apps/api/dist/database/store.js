"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.CadastreStore = void 0;
const sample_data_1 = require("@sih/sample-data");
const crypto_1 = __importDefault(require("crypto"));
/**
 * Cadastral Data Store (PostGIS Compatible Memory Model)
 */
class CadastreStore {
    parcels = new Map();
    buildings = new Map();
    verticalUnits = new Map();
    undergroundAssets = new Map();
    topologyLogs = new Map();
    auditLogs = [];
    accessLogs = [];
    jobs = new Map();
    constructor() {
        this.seedInitialData();
    }
    seedInitialData() {
        sample_data_1.SAMPLE_PARCELS.forEach(p => this.parcels.set(p.id, { ...p, visibleTo: ['revenue', 'engineer', 'utility'] }));
        sample_data_1.SAMPLE_BUILDINGS.forEach(b => this.buildings.set(b.id, { ...b }));
        sample_data_1.SAMPLE_VERTICAL_UNITS.forEach(u => this.verticalUnits.set(u.id, { ...u, visibleTo: ['revenue', 'engineer', 'utility'] }));
        sample_data_1.SAMPLE_UNDERGROUND_ASSETS.forEach(a => this.undergroundAssets.set(a.id, { ...a, visibleTo: ['engineer', 'utility'] }));
        sample_data_1.SAMPLE_TOPOLOGY_LOGS.forEach(l => this.topologyLogs.set(l.id, { ...l }));
        this.auditLogs = [...sample_data_1.SAMPLE_AUDIT_LOGS];
    }
    // --- Parcel Operations ---
    getParcels() {
        return Array.from(this.parcels.values());
    }
    getParcelByUlpin(baseUlpin) {
        return Array.from(this.parcels.values()).find(p => p.ulpin.toUpperCase() === baseUlpin.trim().toUpperCase());
    }
    getParcelById(id) {
        return this.parcels.get(id);
    }
    // --- Building Operations ---
    getBuildings() {
        return Array.from(this.buildings.values());
    }
    getBuildingsByParcelId(parcelId) {
        return Array.from(this.buildings.values()).filter(b => b.parcelId === parcelId);
    }
    getBuildingById(id) {
        return this.buildings.get(id);
    }
    // --- Vertical Unit Operations ---
    getVerticalUnits(buildingId) {
        const all = Array.from(this.verticalUnits.values());
        if (buildingId) {
            return all.filter(u => u.buildingId === buildingId);
        }
        return all;
    }
    getVerticalUnitBy3DUlpin(ulpin3D) {
        return Array.from(this.verticalUnits.values()).find(u => u.ulpin3D.toUpperCase() === ulpin3D.trim().toUpperCase());
    }
    addVerticalUnit(unit, actor = 'SYSTEM_AI') {
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
    getUndergroundAssets(parcelId) {
        const all = Array.from(this.undergroundAssets.values());
        if (parcelId) {
            return all.filter(a => a.parcelId === parcelId);
        }
        return all;
    }
    // --- Topology Conflicts ---
    getTopologyLogs() {
        return Array.from(this.topologyLogs.values());
    }
    getTopologyLogById(id) {
        return this.topologyLogs.get(id);
    }
    resolveConflict(id, resolvedBy, status = 'RESOLVED') {
        const log = this.topologyLogs.get(id);
        if (!log)
            return false;
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
    getJob(id) {
        return this.jobs.get(id);
    }
    saveJob(job) {
        this.jobs.set(job.id, job);
    }
    // --- Access Logs (Feature 3) ---
    logAccess(role, endpoint, ulpinId) {
        this.accessLogs.unshift({
            id: crypto_1.default.randomUUID(),
            role,
            endpoint,
            ulpinId,
            timestamp: new Date().toISOString()
        });
    }
    getAccessLogs(limit = 20) {
        return this.accessLogs.slice(0, limit);
    }
    // --- Immutable Audit Ledger ---
    getAuditLogs() {
        return [...this.auditLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    logAudit(entry) {
        const timestamp = new Date().toISOString();
        const id = `audit-${crypto_1.default.randomUUID().slice(0, 8)}`;
        const payload = JSON.stringify({ id, timestamp, ...entry });
        const hashSignature = crypto_1.default.createHash('sha256').update(payload).digest('hex');
        const log = {
            id,
            timestamp,
            ...entry,
            hashSignature
        };
        this.auditLogs.unshift(log);
        return log;
    }
}
exports.CadastreStore = CadastreStore;
exports.db = new CadastreStore();
