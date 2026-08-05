const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/rbacMiddleware');
const validate = require('../validators/validate');
const {
  createMaterialSchema,
  updateMaterialSchema
} = require('../validators/materialValidator');
const ROLES = require('../constants/roles');

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

module.exports = router;
