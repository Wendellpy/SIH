import { Request, Response, Router } from 'express';
import multer from 'multer';
import { jobsService } from '../services/jobs.service.js';
import { db } from '../database/store.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

export const jobsRouter = Router();

/**
 * POST /api/v1/floorplans/upload
 * Enqueue AI floor plan vectorization and 3D extrusion job
 */
jobsRouter.post('/floorplans/upload', upload.single('file'), (req: Request, res: Response) => {
  const file = req.file;
  const buildingName = (req.body.buildingName as string) || 'BKC Pinnacle Heights';
  const floorNumber = parseInt(req.body.floorNumber as string, 10) || 3;
  const baseUlpin = (req.body.baseUlpin as string) || 'MH13BOM04521873';

  const filename = file ? file.originalname : 'maharera_floorplan_sample.png';
  const size = file ? file.size : 2048500;
  const mimeType = file ? file.mimetype : 'image/png';

  const job = jobsService.createJob('FLOORPLAN_VECTORIZATION', filename, size, mimeType);

  // Trigger async background pipeline
  jobsService.processFloorplanJob(job.id, buildingName, floorNumber, baseUlpin);

  res.status(202).json({
    status: 'accepted',
    message: 'AI Floor plan vectorization job enqueued successfully',
    jobId: job.id,
    data: job
  });
});

/**
 * POST /api/v1/pointcloud/upload
 * Enqueue LiDAR nDSM height extraction job
 */
jobsRouter.post('/pointcloud/upload', upload.single('file'), (req: Request, res: Response) => {
  const file = req.file;
  const baseUlpin = (req.body.baseUlpin as string) || 'MH13BOM04521873';

  const filename = file ? file.originalname : 'mumbai_bkc_lidar_sample.laz';
  const size = file ? file.size : 14850000;
  const mimeType = file ? file.mimetype : 'application/octet-stream';

  const job = jobsService.createJob('LIDAR_NDSM_HEIGHT', filename, size, mimeType);

  // Trigger async background pipeline
  jobsService.processLidarJob(job.id, baseUlpin);

  res.status(202).json({
    status: 'accepted',
    message: 'LiDAR nDSM height extraction job enqueued successfully',
    jobId: job.id,
    data: job
  });
});

/**
 * GET /api/v1/jobs/:id
 * Retrieve AI pipeline execution status and results
 */
jobsRouter.get('/jobs/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const job = db.getJob(id);
  if (!job) {
    return res.status(404).json({ status: 'error', message: `Job ${id} not found` });
  }

  res.json({
    status: 'success',
    data: job
  });
});
