import { Request, Response, Router } from 'express';
import { maharashtraService } from '../services/maharashtra/maharashtra.service.js';

export const maharashtraRouter = Router();

maharashtraRouter.get('/health', async (req: Request, res: Response) => {
  const health = await maharashtraService.getHealth();
  res.json(health);
});

maharashtraRouter.get('/districts', async (req: Request, res: Response) => {
  const result = await maharashtraService.getDistricts();
  res.status(result.success ? 200 : 502).json(result);
});

maharashtraRouter.get('/talukas/:district', async (req: Request, res: Response) => {
  const { district } = req.params;
  const result = await maharashtraService.getTalukas(district);
  res.status(result.success ? 200 : 502).json(result);
});

maharashtraRouter.get('/villages/:taluka', async (req: Request, res: Response) => {
  const { taluka } = req.params;
  const { district } = req.query;
  const result = await maharashtraService.getVillages(district as string, taluka);
  res.status(result.success ? 200 : 502).json(result);
});

maharashtraRouter.post('/cache/refresh', async (req: Request, res: Response) => {
  const { scope, id } = req.body || {};
  try {
    const result = await maharashtraService.refreshJurisdictionCache(scope, id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to refresh cache' });
  }
});

maharashtraRouter.get('/ulpin/:ulpin', async (req: Request, res: Response) => {
  const { ulpin } = req.params;
  const result = await maharashtraService.getUlpin(ulpin);
  res.status(result.success ? 200 : (result.error?.code === 'UPSTREAM_UNAVAILABLE' ? 502 : 400)).json(result);
});

maharashtraRouter.get('/parcel', async (req: Request, res: Response) => {
  const { district, taluka, village, cts } = req.query;
  if (!district || !taluka || !village || !cts) {
    return res.status(400).json({
      success: false,
      source: 'system',
      error: { code: 'INVALID_REQUEST', message: 'Missing required query parameters: district, taluka, village, cts' }
    });
  }
  const result = await maharashtraService.getParcel(district as string, taluka as string, village as string, cts as string);
  
  if (result.success) {
    res.status(200).json(result);
  } else {
    if (result.error?.code === 'PARCEL_NOT_FOUND' || result.error?.code === 'PARCEL_NOT_VERIFIED') {
      res.status(404).json(result);
    } else {
      res.status(502).json(result);
    }
  }
});

maharashtraRouter.get('/ror', async (req: Request, res: Response) => {
  const { district, taluka, village, survey } = req.query;
  if (!district || !taluka || !village || !survey) {
    return res.status(400).json({
      success: false,
      source: 'system',
      error: { code: 'INVALID_REQUEST', message: 'Missing required query parameters: district, taluka, village, survey' }
    });
  }
  const result = await maharashtraService.getRoR(district as string, taluka as string, village as string, survey as string);
  res.status(result.success ? 200 : 502).json(result);
});

maharashtraRouter.get('/mutation/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await maharashtraService.getMutation(id);
  res.status(result.success ? 200 : 502).json(result);
});

maharashtraRouter.post('/property-card/:cts', async (req: Request, res: Response) => {
  // Official API doesn't support programmatic retrieval without specific workflow.
  return res.status(501).json({
    success: false,
    source: 'maharashtra-government',
    error: {
      code: 'NOT_SUPPORTED',
      message: 'Programmatic property-card retrieval is unavailable via this endpoint.'
    }
  });
});
