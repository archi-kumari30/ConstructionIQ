import express from 'express';
const router = express.Router();
import workerController from '../controllers/workerController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';
import validate from '../validators/validate.js';
import {
  createWorkerSchema,
  updateWorkerSchema
} from '../validators/workerValidator.js';
import ROLES from '../constants/roles.js';

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

export default router;
