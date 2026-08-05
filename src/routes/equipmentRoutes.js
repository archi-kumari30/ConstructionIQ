const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/rbacMiddleware');
const validate = require('../validators/validate');
const {
  createEquipmentSchema,
  updateEquipmentSchema,
  updateBookingStatusSchema
} = require('../validators/equipmentValidator');
const ROLES = require('../constants/roles');

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

module.exports = router;
