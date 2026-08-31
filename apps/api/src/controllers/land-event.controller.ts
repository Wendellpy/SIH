import { Request, Response, Router } from 'express';
import { db } from '../database/store.js';
import { landEventService } from '../services/land-event.service.js';
import { LandEvent, LandEventCategory, LandEventType, LandEventStatus, LandEventSeverity } from '@sih/shared-types';

export const landEventRouter = Router();

/**
 * GET /api/v1/land-events
 * List all LandEvents with optional filtering by category, type, status, severity, or ulpin
 */
landEventRouter.get('/land-events', (req: Request, res: Response) => {
  try {
    const { category, type, status, severity, ulpin } = req.query as {
      category?: string;
      type?: string;
      status?: string;
      severity?: string;
      ulpin?: string;
    };

    const events = db.getLandEvents({
      category,
      type,
      status,
      severity,
      ulpin
    });

    return res.json({
      status: 'success',
      count: events.length,
      data: events
    });
  } catch (error: any) {
    console.error('Error fetching land events:', error);
    return res.status(500).json({
      status: 'error',
      message: error?.message || 'Failed to fetch land events'
    });
  }
});

/**
 * GET /api/v1/land-events/:id
 * Retrieve a single LandEvent by its ID
 */
landEventRouter.get('/land-events/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = db.getLandEventById(id);

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: `Land event with ID ${id} not found`
      });
    }

    return res.json({
      status: 'success',
      data: event
    });
  } catch (error: any) {
    console.error(`Error fetching land event ${req.params.id}:`, error);
    return res.status(500).json({
      status: 'error',
      message: error?.message || 'Failed to fetch land event'
    });
  }
});

/**
 * GET /api/v1/parcels/:ulpin/events
 * Get all lifecycle events for a specific parcel or 3D unit
 */
landEventRouter.get('/parcels/:ulpin/events', (req: Request, res: Response) => {
  try {
    const { ulpin } = req.params;
    const allEvents = landEventService.getEventsForUlpin(ulpin);
    const eventsOnly = allEvents.filter(e => e.category === 'EVENT' || e.category === 'VERIFICATION');

    return res.json({
      status: 'success',
      ulpin,
      count: eventsOnly.length,
      data: eventsOnly
    });
  } catch (error: any) {
    console.error(`Error fetching events for ULPIN ${req.params.ulpin}:`, error);
    return res.status(500).json({
      status: 'error',
      message: error?.message || 'Failed to fetch events for parcel'
    });
  }
});

/**
 * GET /api/v1/parcels/:ulpin/conflicts
 * Get all spatial/legal conflicts for a specific parcel or 3D unit
 */
landEventRouter.get('/parcels/:ulpin/conflicts', (req: Request, res: Response) => {
  try {
    const { ulpin } = req.params;
    const allEvents = landEventService.getEventsForUlpin(ulpin);
    const conflictsOnly = allEvents.filter(e => e.category === 'CONFLICT');

    return res.json({
      status: 'success',
      ulpin,
      count: conflictsOnly.length,
      data: conflictsOnly
    });
  } catch (error: any) {
    console.error(`Error fetching conflicts for ULPIN ${req.params.ulpin}:`, error);
    return res.status(500).json({
      status: 'error',
      message: error?.message || 'Failed to fetch conflicts for parcel'
    });
  }
});

/**
 * POST /api/v1/land-events
 * Create a new LandEvent (Lifecycle Event, Conflict, or Verification)
 */
landEventRouter.post('/land-events', (req: Request, res: Response) => {
  try {
    const {
      ulpin,
      category = 'EVENT',
      type,
      parcelId,
      unitId,
      parentId,
      severity,
      description,
      metadata,
      status,
      transactionHash,
      recordHash
    } = req.body;

    if (!ulpin || typeof ulpin !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Missing or invalid field: ulpin is required'
      });
    }

    if (!type || typeof type !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Missing or invalid field: type is required'
      });
    }

    let createdEvent: LandEvent;

    if (category === 'CONFLICT') {
      createdEvent = landEventService.createConflict({
        ulpin,
        type: type as any,
        parcelId,
        unitId,
        parentId,
        severity: severity as any,
        description: description || `Conflict detected: ${type}`,
        metadata
      });
    } else if (category === 'VERIFICATION') {
      createdEvent = landEventService.createVerificationEvent({
        ulpin,
        type: type as any,
        parcelId,
        unitId,
        status: status as any,
        description: description || `Verification record: ${type}`,
        transactionHash,
        recordHash,
        metadata
      });
    } else {
      createdEvent = landEventService.createEvent({
        ulpin,
        type: type as any,
        parcelId,
        unitId,
        parentId,
        description: description || `Land event: ${type}`,
        metadata,
        recordHash,
        status: status as any
      });
    }

    return res.status(201).json({
      status: 'success',
      data: createdEvent
    });
  } catch (error: any) {
    console.error('Error creating land event:', error);
    return res.status(500).json({
      status: 'error',
      message: error?.message || 'Failed to create land event'
    });
  }
});

/**
 * PATCH /api/v1/land-events/:id/resolve
 * Resolve or reject an open conflict LandEvent
 */
landEventRouter.patch('/land-events/:id/resolve', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const resolvedBy = (req.body.resolvedBy as string) || 'DoLR Verifier Officer';
    const status = (req.body.status as 'RESOLVED' | 'REJECTED') || 'RESOLVED';
    const notes = req.body.notes as string | undefined;

    // Check if event exists
    const existing = db.getLandEventById(id);
    if (!existing) {
      return res.status(404).json({
        status: 'error',
        message: `Land event with ID ${id} not found`
      });
    }

    // Resolve in store and service
    const resolved = landEventService.resolveConflict(id, resolvedBy, status, notes);

    // Also update topologyLogs if this ID matches a topology log
    const topologyLog = db.getTopologyLogById(id);
    if (topologyLog) {
      db.resolveConflict(id, resolvedBy, status);
    }

    return res.json({
      status: 'success',
      message: `Conflict ${id} marked as ${status} by ${resolvedBy}`,
      data: resolved || db.getLandEventById(id)
    });
  } catch (error: any) {
    console.error(`Error resolving land event ${req.params.id}:`, error);
    return res.status(500).json({
      status: 'error',
      message: error?.message || 'Failed to resolve land event'
    });
  }
});

/**
 * POST /api/v1/land-events/:id/anchor
 * Anchor a finalized LandEvent onto the Ethereum Sepolia LandLedger smart contract
 */
landEventRouter.post('/land-events/:id/anchor', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const event = db.getLandEventById(id);

    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: `Land event with ID ${id} not found`
      });
    }

    const { blockchainService } = await import('../services/blockchain.service.js');
    const anchoredEvent = await blockchainService.anchorLandEvent(event);

    return res.json({
      status: 'success',
      data: anchoredEvent
    });
  } catch (error: any) {
    console.error(`Error anchoring land event ${req.params.id}:`, error);
    return res.status(500).json({
      status: 'error',
      message: error?.message || 'Failed to anchor land event on blockchain'
    });
  }
});

/**
 * GET /api/v1/land-events/:id/verify-blockchain
 * Cryptographically verify LandEvent against on-chain LandLedger contract on Sepolia
 */
landEventRouter.get('/land-events/:id/verify-blockchain', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { blockchainService } = await import('../services/blockchain.service.js');
    const result = await blockchainService.verifyLandEvent(id);

    return res.json({
      status: 'success',
      data: result
    });
  } catch (error: any) {
    console.error(`Error verifying land event ${req.params.id}:`, error);
    return res.status(500).json({
      status: 'error',
      message: error?.message || 'Failed to verify land event on blockchain'
    });
  }
});
