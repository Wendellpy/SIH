import { Request, Response, Router } from 'express';
import { db } from '../database/store.js';

export const adminRouter = Router();

/**
 * GET /api/v1/admin/conflicts
 * List all detected 3D topology conflicts and warnings
 */
adminRouter.get('/conflicts', (req: Request, res: Response) => {
  const logs = db.getTopologyLogs();
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
adminRouter.post('/conflicts/:id/resolve', (req: Request, res: Response) => {
  const { id } = req.params;
  const resolvedBy = (req.body.resolvedBy as string) || 'DoLR Verifier Officer';
  const action = (req.body.action as 'RESOLVED' | 'REJECTED') || 'RESOLVED';

  const ok = db.resolveConflict(id, resolvedBy, action);
  if (!ok) {
    return res.status(404).json({ status: 'error', message: `Conflict log ${id} not found` });
  }

  res.json({
    status: 'success',
    message: `Conflict ${id} marked as ${action} by ${resolvedBy}`,
    data: db.getTopologyLogById(id)
  });
});

/**
 * GET /api/v1/admin/audit-logs
 * Fetch the immutable cadastral mutation ledger
 */
adminRouter.get('/audit-logs', (req: Request, res: Response) => {
  const logs = db.getAuditLogs();
  res.json({
    status: 'success',
    count: logs.length,
    data: logs
  });
});
