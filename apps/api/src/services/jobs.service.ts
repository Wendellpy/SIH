import { AIJob, JobType } from '@sih/shared-types';
import { db } from '../database/store.js';
import crypto from 'crypto';

export type JobProgressCallback = (job: AIJob) => void;

export class JobsService {
  private subscribers: Set<JobProgressCallback> = new Set();

  subscribe(cb: JobProgressCallback) {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }

  private notify(job: AIJob) {
    this.subscribers.forEach(cb => {
      try {
        cb(job);
      } catch (err) {
        console.error('Error notifying subscriber:', err);
      }
    });
  }

  createJob(
    type: JobType,
    filename: string,
    fileSizeBytes: number,
    mimeType: string
  ): AIJob {
    const job: AIJob = {
      id: `job-${crypto.randomUUID().slice(0, 8)}`,
      type,
      status: 'PENDING',
      progress: 0,
      currentStage: 'Queued in BullMQ async pipeline',
      inputFilename: filename,
      fileSizeBytes,
      mimeType,
      createdAt: new Date().toISOString()
    };
    db.saveJob(job);
    this.notify(job);
    return job;
  }

  async processFloorplanJob(
    jobId: string,
    buildingName: string,
    floorNumber: number,
    baseUlpin: string
  ) {
    const job = db.getJob(jobId);
    if (!job) return;

    const stages = [
      { progress: 15, stage: 'Raster Image Preprocessing & Contrast Enhancement (MahaRERA layout)' },
      { progress: 35, stage: 'Deep Learning Boundary Segmentation (Wall & Room Detection)' },
      { progress: 60, stage: 'OCR Annotation Extraction & Room Code Association' },
      { progress: 80, stage: '3D Solid Extrusion & 3D ULPIN Code Assignment' },
      { progress: 95, stage: '3D Cadastral Solid Topology & Water-tightness Verification' },
      { progress: 100, stage: 'Job Completed - 3D Units Added to Cadastral Database' }
    ];

    job.status = 'PROCESSING';
    db.saveJob(job);
    this.notify(job);

    for (let i = 0; i < stages.length; i++) {
      await new Promise(r => setTimeout(r, 600)); // Smooth progression simulation
      job.progress = stages[i].progress;
      job.currentStage = stages[i].stage;
      db.saveJob(job);
      this.notify(job);
    }

    // Generate output 3D units
    const levelCode = floorNumber >= 0 ? `+${floorNumber.toString().padStart(2, '0')}` : floorNumber.toString().padStart(2, '0');
    const ceilingHeight = 3.8;
    const plinthDatum = 4.5;
    const zMin = plinthDatum + (floorNumber - 1) * ceilingHeight;
    const zMax = zMin + ceilingHeight;

    const generatedUnits = [
      {
        unitCode: `A${floorNumber}01`,
        unitName: `${buildingName} - Unit A${floorNumber}01 (East Wing)`,
        ulpin3D: `${baseUlpin}.A${levelCode}-A${floorNumber}01`,
        carpetAreaSqm: 540.0,
        volumeCum: 540.0 * ceilingHeight,
        zMin,
        zMax,
        useType: 'Commercial',
        ownerName: 'State Bank FinTech Subsidiary',
        ownerId: 'CORP-SBI-991'
      },
      {
        unitCode: `B${floorNumber}02`,
        unitName: `${buildingName} - Unit B${floorNumber}02 (West Wing)`,
        ulpin3D: `${baseUlpin}.A${levelCode}-B${floorNumber}02`,
        carpetAreaSqm: 620.0,
        volumeCum: 620.0 * ceilingHeight,
        zMin,
        zMax,
        useType: 'Commercial',
        ownerName: 'National Payments Innovation Trust',
        ownerId: 'CORP-NPCI-402'
      }
    ];

    job.status = 'COMPLETED';
    job.completedAt = new Date().toISOString();
    job.results = {
      buildingName,
      floorNumber,
      levelCode,
      baseUlpin,
      totalAreaSqm: 1160.0,
      totalVolumeCum: 1160.0 * ceilingHeight,
      unitsCreated: generatedUnits
    };

    db.saveJob(job);
    this.notify(job);

    // Save newly vectorized units to Cadastre store
    generatedUnits.forEach(u => {
      db.addVerticalUnit({
        id: `unit-ai-${crypto.randomUUID().slice(0, 8)}`,
        buildingId: 'bldg-bkc-fintech-tower',
        parcelId: 'parcel-mumbai-bkc-01',
        ulpin3D: u.ulpin3D,
        domainCode: 'A',
        levelCode,
        unitCode: u.unitCode,
        floorNumber,
        unitName: u.unitName,
        useType: u.useType as any,
        ownerName: u.ownerName,
        ownerId: u.ownerId,
        carpetAreaSqm: u.carpetAreaSqm,
        builtupAreaSqm: u.carpetAreaSqm * 1.15,
        volumeCum: u.volumeCum,
        zMin: u.zMin,
        zMax: u.zMax,
        verticalDatum: 'WGS84 MSL (Plinth +4.5m)',
        bounds: { minLng: 72.8685, maxLng: 72.8692, minLat: 19.0604, maxLat: 19.0610, minZ: u.zMin, maxZ: u.zMax },
        validationStatus: 'VALID',
        provenance: 'MAHARERA_PLAN',
        taxStatus: 'PAID',
        simulated: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, 'AI_FLOORPLAN_EXTRUDER');
    });
  }

  async processLidarJob(jobId: string, baseUlpin: string) {
    const job = db.getJob(jobId);
    if (!job) return;

    const stages = [
      { progress: 20, stage: 'Parsing LAS/LAZ Point Cloud Tiles (1.42M Points)' },
      { progress: 45, stage: 'Classifying Ground vs Non-Ground Returns (CSF Filter)' },
      { progress: 70, stage: 'Generating Digital Elevation Model (DEM) & Digital Surface Model (DSM)' },
      { progress: 85, stage: 'Computing Normalized DSM (nDSM = DSM - DEM) Height Raster' },
      { progress: 100, stage: 'LiDAR Profile Extracted & Committed' }
    ];

    job.status = 'PROCESSING';
    db.saveJob(job);
    this.notify(job);

    for (let i = 0; i < stages.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      job.progress = stages[i].progress;
      job.currentStage = stages[i].stage;
      db.saveJob(job);
      this.notify(job);
    }

    job.status = 'COMPLETED';
    job.completedAt = new Date().toISOString();
    job.results = {
      baseUlpin,
      pointsProcessed: 1428500,
      groundElevationM: 4.85,
      peakHeightM: 68.50,
      ndsmBuildingHeightM: 63.65,
      estimatedFloors: 16,
      roofPitchDeg: 1.4,
      pointDensityPtsPerM2: 34.2
    };

    db.saveJob(job);
    this.notify(job);
  }
}

export const jobsService = new JobsService();
