import express from 'express';
const router = express.Router();
import equipmentController from '../controllers/equipmentController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';
import validate from '../validators/validate.js';
import {
  createEquipmentSchema,
  updateEquipmentSchema,
  updateBookingStatusSchema
} from '../validators/equipmentValidator.js';
import ROLES from '../constants/roles.js';

// Apply JWT verification
router.use(protect);

// Global Fleet CRUD
router.get('/', equipmentController.listEquipment);
router.get('/:id', equipmentController.getEquipment);

router.post(
  '/',
  authorize(ROLES.ADMIN),
  validate(createEquipmentSchema),
  equipmentController.createEquipment
);

router.put(
  '/:id',
  authorize(ROLES.ADMIN),
  validate(updateEquipmentSchema),
  equipmentController.updateEquipment
);

router.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  equipmentController.deleteEquipment
);

// Booking Status Transition (Mounted directly as it is booking specific, not project specific)
router.put(
  '/bookings/:id/status',
  authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  validate(updateBookingStatusSchema),
  equipmentController.updateBookingStatus
);

export default router;
