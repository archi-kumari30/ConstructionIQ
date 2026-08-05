const express = require('express');
const router = express.Router();
const workerController = require('../controllers/workerController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/rbacMiddleware');
const validate = require('../validators/validate');
const {
  createWorkerSchema,
  updateWorkerSchema
} = require('../validators/workerValidator');
const ROLES = require('../constants/roles');

// Apply JWT verification
router.use(protect);

// Global Workforce CRUD
router.get(
  '/',
  authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.SITE_ENGINEER, ROLES.CONTRACTOR),
  workerController.listWorkers
);

router.get(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.SITE_ENGINEER, ROLES.CONTRACTOR),
  workerController.getWorker
);

router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.CONTRACTOR),
  validate(createWorkerSchema),
  workerController.createWorker
);

router.put(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.CONTRACTOR),
  validate(updateWorkerSchema),
  workerController.updateWorker
);

router.delete(
  '/:id',
  authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER, ROLES.CONTRACTOR),
  workerController.deleteWorker
);

module.exports = router;
