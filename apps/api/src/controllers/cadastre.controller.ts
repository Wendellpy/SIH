import { Request, Response, Router } from 'express';
import { db } from '../database/store.js';
import { ulpinService } from '../services/ulpin.service.js';

export const cadastreRouter = Router();

/**
 * GET /api/v1/parcels
 * List all surface cadastral parcels
 */
cadastreRouter.get('/parcels', (req: Request, res: Response) => {
  const parcels = db.getParcels();
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
cadastreRouter.get('/parcels/:ulpin', (req: Request, res: Response) => {
  const { ulpin } = req.params;
  const parcel = db.getParcelByUlpin(ulpin);
  if (!parcel) {
    return res.status(404).json({ status: 'error', message: `Parcel with ULPIN ${ulpin} not found` });
  }

  const buildings = db.getBuildingsByParcelId(parcel.id);
  const verticalUnits = db.getVerticalUnits().filter(u => u.parcelId === parcel.id);
  const undergroundAssets = db.getUndergroundAssets(parcel.id);

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
cadastreRouter.get('/buildings', (req: Request, res: Response) => {
  const buildings = db.getBuildings();
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
cadastreRouter.get('/buildings/:id/units', (req: Request, res: Response) => {
  const { id } = req.params;
  const units = db.getVerticalUnits(id);
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
cadastreRouter.get('/ulpin/:id3d', (req: Request, res: Response) => {
  const { id3d } = req.params;
  const result = ulpinService.resolve(id3d);
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
cadastreRouter.get('/underground', (req: Request, res: Response) => {
  const parcelId = req.query.parcelId as string | undefined;
  const assets = db.getUndergroundAssets(parcelId);
  res.json({
    status: 'success',
    count: assets.length,
    data: assets
  });
});

/**
 * GET /api/v1/search
 * Universal search query across 3D ULPINs, owners, addresses, and utilities
 */
cadastreRouter.get('/search', (req: Request, res: Response) => {
  const query = (req.query.q as string) || '';
  const results = ulpinService.search(query);
  res.json({
    status: 'success',
    query,
    count: results.length,
    data: results
  });
});
