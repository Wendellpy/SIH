"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobsRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const jobs_service_js_1 = require("../services/jobs.service.js");
const store_js_1 = require("../database/store.js");
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});
exports.jobsRouter = (0, express_1.Router)();
/**
 * POST /api/v1/floorplans/upload
 * Enqueue AI floor plan vectorization and 3D extrusion job
 */
exports.jobsRouter.post('/floorplans/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    const buildingName = req.body.buildingName || 'BKC Pinnacle Heights';
    const floorNumber = parseInt(req.body.floorNumber, 10) || 3;
    const baseUlpin = req.body.baseUlpin || 'MH13BOM04521873';
    const filename = file ? file.originalname : 'maharera_floorplan_sample.png';
    const size = file ? file.size : 2048500;
    const mimeType = file ? file.mimetype : 'image/png';
    const job = jobs_service_js_1.jobsService.createJob('FLOORPLAN_VECTORIZATION', filename, size, mimeType);
    // Trigger async background pipeline
    jobs_service_js_1.jobsService.processFloorplanJob(job.id, buildingName, floorNumber, baseUlpin);
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
exports.jobsRouter.post('/pointcloud/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    const baseUlpin = req.body.baseUlpin || 'MH13BOM04521873';
    const filename = file ? file.originalname : 'mumbai_bkc_lidar_sample.laz';
    const size = file ? file.size : 14850000;
    const mimeType = file ? file.mimetype : 'application/octet-stream';
    const job = jobs_service_js_1.jobsService.createJob('LIDAR_NDSM_HEIGHT', filename, size, mimeType);
    // Trigger async background pipeline
    jobs_service_js_1.jobsService.processLidarJob(job.id, baseUlpin);
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
exports.jobsRouter.get('/jobs/:id', (req, res) => {
    const { id } = req.params;
    const job = store_js_1.db.getJob(id);
    if (!job) {
        return res.status(404).json({ status: 'error', message: `Job ${id} not found` });
    }
    res.json({
        status: 'success',
        data: job
    });
});
