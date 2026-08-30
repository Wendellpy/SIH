"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cadastreRouter = void 0;
const express_1 = require("express");
const store_js_1 = require("../database/store.js");
const ulpin_service_js_1 = require("../services/ulpin.service.js");
const property_card_service_js_1 = require("../services/property-card.service.js");
const role_middleware_js_1 = require("../middleware/role.middleware.js");
exports.cadastreRouter = (0, express_1.Router)();
/**
 * GET /api/v1/parcels
 * List all surface cadastral parcels
 */
exports.cadastreRouter.get('/parcels', (req, res) => {
    const parcels = store_js_1.db.getParcels();
    res.json({
        status: 'success',
        count: parcels.length,
        data: parcels
    });
});
/**
 * GET /api/v1/parcels/:ulpin
 * Get parcel by base 14-char ULPIN, including linked buildings, vertical units, and underground assets
 */
exports.cadastreRouter.get('/parcels/:ulpin', (req, res) => {
    const { ulpin } = req.params;
    const parcel = store_js_1.db.getParcelByUlpin(ulpin);
    if (!parcel) {
        return res.status(404).json({ status: 'error', message: `Parcel with ULPIN ${ulpin} not found` });
    }
    const buildings = store_js_1.db.getBuildingsByParcelId(parcel.id);
    const verticalUnits = store_js_1.db.getVerticalUnits().filter(u => u.parcelId === parcel.id);
    const undergroundAssets = store_js_1.db.getUndergroundAssets(parcel.id);
    res.json({
        status: 'success',
        data: {
            parcel,
            buildings,
            verticalUnits,
            undergroundAssets
        }
    });
});
/**
 * GET /api/v1/buildings
 * List buildings with footprint geometry and height metrics
 */
exports.cadastreRouter.get('/buildings', (req, res) => {
    const buildings = store_js_1.db.getBuildings();
    res.json({
        status: 'success',
        count: buildings.length,
        data: buildings
    });
});
/**
 * GET /api/v1/buildings/:id/units
 * List vertical units for a specific building
 */
exports.cadastreRouter.get('/buildings/:id/units', (req, res) => {
    const { id } = req.params;
    const units = store_js_1.db.getVerticalUnits(id);
    res.json({
        status: 'success',
        buildingId: id,
        count: units.length,
        data: units
    });
});
/**
 * GET /api/v1/ulpin/:id3d
 * Resolve a full 3D ULPIN to its complete spatial record
 */
exports.cadastreRouter.get('/ulpin/:id3d', (req, res) => {
    const { id3d } = req.params;
    const result = ulpin_service_js_1.ulpinService.resolve(id3d);
    if (!result) {
        return res.status(404).json({
            status: 'error',
            message: `Invalid or unresolvable 3D ULPIN: ${id3d}`
        });
    }
    res.json({
        status: 'success',
        data: result
    });
});
/**
 * GET /api/v1/underground
 * List underground utility infrastructure with 3D depth geometry
 */
exports.cadastreRouter.get('/underground', (0, role_middleware_js_1.roleMiddleware)(['engineer', 'utility']), (req, res) => {
    const parcelId = req.query.parcelId;
    const assets = store_js_1.db.getUndergroundAssets(parcelId);
    res.json({
        status: 'success',
        count: assets.length,
        data: assets
    });
});
/**
 * GET /api/v1/access-log
 * Get the recent access log
 */
exports.cadastreRouter.get('/access-log', (0, role_middleware_js_1.roleMiddleware)(['revenue', 'admin']), (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
    res.json({
        status: 'success',
        data: store_js_1.db.getAccessLogs(limit)
    });
});
/**
 * POST /api/v1/certificate
 * Export clearance certificate
 */
exports.cadastreRouter.post('/certificate', (0, role_middleware_js_1.roleMiddleware)(['engineer']), async (req, res) => {
    try {
        const { conflicts, footprint } = req.body;
        // We reuse PropertyCardService's hashing concept but format a certificate
        // Creating a mock entity to pass to generateCard (or we can add a generateCertificate method)
        // For now, we will add generateCertificate to PropertyCardService.
        const { pdfBuffer, recordHash } = await property_card_service_js_1.PropertyCardService.generateCertificate(conflicts, footprint);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Clearance_Certificate.pdf"`);
        res.setHeader('X-Record-Hash', recordHash);
        return res.send(pdfBuffer);
    }
    catch (err) {
        console.error('Failed to generate clearance certificate:', err);
        return res.status(500).json({ status: 'error', message: 'Failed to generate certificate' });
    }
});
/**
 * GET /api/v1/search
 * Universal search query across 3D ULPINs, owners, addresses, and utilities
 */
exports.cadastreRouter.get('/search', (req, res) => {
    const query = req.query.q || '';
    const results = ulpin_service_js_1.ulpinService.search(query);
    res.json({
        status: 'success',
        query,
        count: results.length,
        data: results
    });
});
/**
 * POST /api/v1/units/:ulpin/property-card
 * Generate a PDF property card for a specific 3D ULPIN
 */
exports.cadastreRouter.post('/units/:ulpin/property-card', async (req, res) => {
    try {
        const { ulpin } = req.params;
        const { thumbnailBase64, simulatedData, simulatedType } = req.body; // Expect JSON body parsing middleware is enabled
        // Try finding as VerticalUnit
        let entity = store_js_1.db.getVerticalUnitBy3DUlpin(ulpin);
        let type = 'VerticalUnit';
        // If not found, try finding as Parcel
        if (!entity) {
            entity = store_js_1.db.getParcelByUlpin(ulpin);
            type = 'Parcel';
        }
        // If not found, try finding as UndergroundAsset
        if (!entity) {
            entity = store_js_1.db.getUndergroundAssets().find(a => a.ulpin3D.toUpperCase() === ulpin.toUpperCase());
            type = 'UndergroundAsset';
        }
        if (!entity && simulatedData) {
            entity = simulatedData;
            type = simulatedType;
        }
        if (!entity) {
            return res.status(404).json({ status: 'error', message: `No record found for ULPIN ${ulpin}` });
        }
        const { pdfBuffer, recordHash } = await property_card_service_js_1.PropertyCardService.generateCard(entity, type, thumbnailBase64);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="Property_Card_${ulpin}.pdf"`);
        res.setHeader('X-Record-Hash', recordHash);
        return res.send(pdfBuffer);
    }
    catch (err) {
        console.error('Failed to generate property card:', err);
        return res.status(500).json({ status: 'error', message: 'Failed to generate property card' });
    }
});
