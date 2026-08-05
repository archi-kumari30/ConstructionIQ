const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const healthRoutes = require('./healthRoutes');

const projectRoutes = require('./projectRoutes');

const materialRoutes = require('./materialRoutes');

const equipmentRoutes = require('./equipmentRoutes');

const workerRoutes = require('./workerRoutes');

// Mount routes with /api/v1 version prefix
router.use('/v1/auth', authRoutes);
router.use('/v1/projects', projectRoutes);
router.use('/v1/materials', materialRoutes);
router.use('/v1/equipment', equipmentRoutes);
router.use('/v1/workers', workerRoutes);
router.use('/v1', healthRoutes); // Mount GET /v1/health

module.exports = router;
