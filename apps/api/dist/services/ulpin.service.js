"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ulpinService = exports.UlpinService = void 0;
const shared_types_1 = require("@sih/shared-types");
const store_js_1 = require("../database/store.js");
class UlpinService {
    /**
     * Parse and validate 3D ULPIN
     */
    parse(ulpinString) {
        return (0, shared_types_1.parseUlpin3D)(ulpinString);
    }
    /**
     * Format 3D ULPIN from parts
     */
    format(baseUlpin, domain, level, unitCode) {
        return (0, shared_types_1.formatUlpin3D)(baseUlpin, domain, level, unitCode);
    }
    /**
     * Resolve full 3D hierarchy for a 3D ULPIN
     */
    resolve(ulpin3DString) {
        const parsed = this.parse(ulpin3DString);
        if (!parsed)
            return null;
        const unit = store_js_1.db.getVerticalUnitBy3DUlpin(ulpin3DString);
        const parcel = store_js_1.db.getParcelByUlpin(parsed.baseUlpin);
        const building = unit ? store_js_1.db.getBuildingById(unit.buildingId) : (parcel ? store_js_1.db.getBuildingsByParcelId(parcel.id)[0] : undefined);
        const undergroundAssets = parcel ? store_js_1.db.getUndergroundAssets(parcel.id) : [];
        return {
            ulpin3D: parsed.rawString,
            parsed,
            unit,
            building,
            parcel,
            undergroundAssets
        };
    }
    /**
     * Universal Cadastral Search
     */
    search(query) {
        const q = query.trim().toLowerCase();
        if (!q)
            return [];
        const results = [];
        // 1. Search 3D Units
        store_js_1.db.getVerticalUnits().forEach(u => {
            if (u.ulpin3D.toLowerCase().includes(q) ||
                u.unitName.toLowerCase().includes(q) ||
                u.ownerName.toLowerCase().includes(q) ||
                u.unitCode.toLowerCase().includes(q)) {
                results.push({
                    type: '3D_UNIT',
                    title: u.unitName,
                    subtitle: `3D ULPIN: ${u.ulpin3D} | Owner: ${u.ownerName}`,
                    id: u.id,
                    ulpin: u.ulpin3D,
                    metadata: u
                });
            }
        });
        // 2. Search Parcels
        store_js_1.db.getParcels().forEach(p => {
            if (p.ulpin.toLowerCase().includes(q) ||
                p.village.toLowerCase().includes(q) ||
                p.surveyNumber.toLowerCase().includes(q)) {
                results.push({
                    type: 'PARCEL',
                    title: `Parcel ${p.ulpin} (${p.village})`,
                    subtitle: `Survey No: ${p.surveyNumber} | Area: ${p.areaSqm} sqm`,
                    id: p.id,
                    ulpin: p.ulpin,
                    metadata: p
                });
            }
        });
        // 3. Search Buildings
        store_js_1.db.getBuildings().forEach(b => {
            if (b.name.toLowerCase().includes(q) || b.address.toLowerCase().includes(q)) {
                results.push({
                    type: 'BUILDING',
                    title: b.name,
                    subtitle: `${b.numFloors} Floors | ${b.address}`,
                    id: b.id,
                    ulpin: b.id,
                    metadata: b
                });
            }
        });
        // 4. Search Underground Utilities
        store_js_1.db.getUndergroundAssets().forEach(a => {
            if (a.ulpin3D.toLowerCase().includes(q) ||
                a.assetType.toLowerCase().includes(q) ||
                a.owningAgency.toLowerCase().includes(q)) {
                results.push({
                    type: 'UNDERGROUND',
                    title: `Underground ${a.assetType} Duct`,
                    subtitle: `3D ULPIN: ${a.ulpin3D} | Depth: ${a.depthMinM}m to ${a.depthMaxM}m | Agency: ${a.owningAgency}`,
                    id: a.id,
                    ulpin: a.ulpin3D,
                    metadata: a
                });
            }
        });
        return results.slice(0, 15);
    }
}
exports.UlpinService = UlpinService;
exports.ulpinService = new UlpinService();
