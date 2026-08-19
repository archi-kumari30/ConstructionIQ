import express from 'express';
const router = express.Router();
import authRoutes from './authRoutes.js';
import healthRoutes from './healthRoutes.js';

import projectRoutes from './projectRoutes.js';

import materialRoutes from './materialRoutes.js';

import equipmentRoutes from './equipmentRoutes.js';

import workerRoutes from './workerRoutes.js';

// Mount routes with /api/v1 version prefix
router.use('/v1/auth', authRoutes);
router.use('/v1/projects', projectRoutes);
router.use('/v1/materials', materialRoutes);
router.use('/v1/equipment', equipmentRoutes);
router.use('/v1/workers', workerRoutes);
router.use('/v1', healthRoutes); // Mount GET /v1/health

export default router;
