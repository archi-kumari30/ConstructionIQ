import express from 'express';
const router = express.Router();
import materialController from '../controllers/materialController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/rbacMiddleware.js';
import validate from '../validators/validate.js';
import {
  createMaterialSchema,
  updateMaterialSchema
} from '../validators/materialValidator.js';
import ROLES from '../constants/roles.js';

// Apply JWT verification
router.use(protect);

// Global Catalog CRUD
router.get('/', materialController.listMaterials);

router.post(
  '/',
  authorize(ROLES.ADMIN),
  validate(createMaterialSchema),
  materialController.createMaterial
);

router.put(
  '/:id',
  authorize(ROLES.ADMIN),
  validate(updateMaterialSchema),
  materialController.updateMaterial
);

router.delete(
  '/:id',
  authorize(ROLES.ADMIN),
  materialController.deleteMaterial
);

export default router;
