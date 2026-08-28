"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const store_js_1 = require("../database/store.js");
exports.adminRouter = (0, express_1.Router)();
/**
 * GET /api/v1/admin/conflicts
 * List all detected 3D topology conflicts and warnings
 */
exports.adminRouter.get('/conflicts', (req, res) => {
    const logs = store_js_1.db.getTopologyLogs();
    res.json({
        status: 'success',
        count: logs.length,
        data: logs
    });
});
/**
 * POST /api/v1/admin/conflicts/:id/resolve
 * DoLR verifier action to resolve or reject a flagged 3D spatial conflict
 */
exports.adminRouter.post('/conflicts/:id/resolve', (req, res) => {
    const { id } = req.params;
    const resolvedBy = req.body.resolvedBy || 'DoLR Verifier Officer';
    const action = req.body.action || 'RESOLVED';
    const ok = store_js_1.db.resolveConflict(id, resolvedBy, action);
    if (!ok) {
        return res.status(404).json({ status: 'error', message: `Conflict log ${id} not found` });
    }
    res.json({
        status: 'success',
        message: `Conflict ${id} marked as ${action} by ${resolvedBy}`,
        data: store_js_1.db.getTopologyLogById(id)
    });
});
/**
 * GET /api/v1/admin/audit-logs
 * Fetch the immutable cadastral mutation ledger
 */
exports.adminRouter.get('/audit-logs', (req, res) => {
    const logs = store_js_1.db.getAuditLogs();
    res.json({
        status: 'success',
        count: logs.length,
        data: logs
    });
});
