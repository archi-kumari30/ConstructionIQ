const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const { protect } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/rbacMiddleware');
const { checkProjectAccess } = require('../middlewares/rlacMiddleware');
const validate = require('../validators/validate');
const {
  createProjectSchema,
  updateProjectSchema,
  addTeamMemberSchema,
  createMilestoneSchema,
  updateMilestoneSchema
} = require('../validators/projectValidator');
const ROLES = require('../constants/roles');

// Apply protection to all project routes
router.use(protect);

const materialController = require('../controllers/materialController');
const {
  logTransactionSchema,
  createRequestSchema,
  approveRequestSchema,
  updateThresholdSchema
} = require('../validators/materialValidator');

const equipmentController = require('../controllers/equipmentController');
const {
  createBookingSchema,
  logUsageSchema
} = require('../validators/equipmentValidator');

const workerController = require('../controllers/workerController');
const {
  logAttendanceSchema
} = require('../validators/workerValidator');

const financeController = require('../controllers/financeController');
const {
  createDeliverySchema,
  updateDeliveryStatusSchema,
  createBudgetSchema,
  createExpenseSchema
} = require('../validators/financeValidator');

const reportController = require('../controllers/reportController');
const { parser, uploadAndCompressImages } = require('../middlewares/uploadMiddleware');
const {
  createIncidentSchema,
  updateIncidentSchema,
  createDailyReportSchema
} = require('../validators/reportValidator');

// --- Project CRUD ---
router.post(
  '/',
  authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  validate(createProjectSchema),
  projectController.createProject
);

router.get('/', projectController.listProjects);

router.get('/:id', checkProjectAccess, projectController.getProject);

router.put(
  '/:id',
  checkProjectAccess,
  authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  validate(updateProjectSchema),
  projectController.updateProject
);

router.delete(
  '/:id',
  checkProjectAccess,
  authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  projectController.deleteProject
);

// --- Team Management (Nested under Project ID) ---
router.get('/:projectId/team', checkProjectAccess, projectController.getTeamMembers);

router.post(
  '/:projectId/team',
  checkProjectAccess,
  authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  validate(addTeamMemberSchema),
  projectController.addTeamMember
);

router.delete(
  '/:projectId/team/:userId',
  checkProjectAccess,
  authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  projectController.removeTeamMember
);

// --- Milestone Management (Nested under Project ID) ---
router.get('/:projectId/milestones', checkProjectAccess, projectController.listMilestones);

router.post(
  '/:projectId/milestones',
  checkProjectAccess,
  authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  validate(createMilestoneSchema),
  projectController.addMilestone
);

router.put(
  '/:projectId/milestones/:id',
  checkProjectAccess,
  authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  validate(updateMilestoneSchema),
  projectController.updateMilestone
);

router.delete(
  '/:projectId/milestones/:id',
  checkProjectAccess,
  authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  projectController.deleteMilestone
);

// --- Nested Project Inventory ---
router.get('/:projectId/inventory', checkProjectAccess, materialController.getInventory);

router.put(
  '/:projectId/inventory/:materialId/threshold',
  checkProjectAccess,
  authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  validate(updateThresholdSchema),
  materialController.updateThreshold
);

// --- Nested Project Material Ledger Transactions ---
router.get('/:projectId/transactions', checkProjectAccess, materialController.listTransactions);

router.post(
  '/:projectId/transactions',
  checkProjectAccess,
  authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  validate(logTransactionSchema),
  materialController.logTransaction
);

// --- Nested Project Material Requests ---
router.get('/:projectId/requests', checkProjectAccess, materialController.listRequests);

router.post(
  '/:projectId/requests',
  checkProjectAccess,
  validate(createRequestSchema),
  materialController.createRequest
);

router.put(
  '/:projectId/requests/:id/approve',
  checkProjectAccess,
  authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  validate(approveRequestSchema),
  materialController.approveRequest
);

router.post(
  '/:projectId/requests/:id/fulfill',
  checkProjectAccess,
  authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  materialController.fulfillRequest
);

// --- Nested Project Fleet Bookings ---
router.get('/:projectId/bookings', checkProjectAccess, equipmentController.listBookings);

router.post(
  '/:projectId/bookings',
  checkProjectAccess,
  authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  validate(createBookingSchema),
  equipmentController.createBooking
);

// --- Nested Project Telemetry logs ---
router.get('/:projectId/telemetry', checkProjectAccess, equipmentController.listUsageLogs);

router.post(
  '/:projectId/telemetry',
  checkProjectAccess,
  validate(logUsageSchema),
  equipmentController.logUsage
);

// --- Nested Project Workforce Attendance ---
router.get('/:projectId/attendance', checkProjectAccess, workerController.getAttendanceReport);

router.post(
  '/:projectId/attendance',
  checkProjectAccess,
  validate(logAttendanceSchema),
  workerController.logAttendance
);

// --- Nested Project Logistics (Deliveries) ---
router.get('/:projectId/deliveries', checkProjectAccess, financeController.listDeliveries);

router.post(
  '/:projectId/deliveries',
  checkProjectAccess,
  validate(createDeliverySchema),
  financeController.createDelivery
);

router.put(
  '/:projectId/deliveries/:id',
  checkProjectAccess,
  validate(updateDeliveryStatusSchema),
  financeController.updateDeliveryStatus
);

// --- Nested Project Budgets ---
router.get('/:projectId/budgets', checkProjectAccess, financeController.getBudgetSummary);

router.post(
  '/:projectId/budgets',
  checkProjectAccess,
  authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  validate(createBudgetSchema),
  financeController.allocateBudget
);

// --- Nested Project Expenses ---
router.get('/:projectId/expenses', checkProjectAccess, financeController.listExpenses);

router.post(
  '/:projectId/expenses',
  checkProjectAccess,
  validate(createExpenseSchema),
  financeController.logExpense
);

// --- Incidents & Safety ---
router.get('/incidents/:id', reportController.getIncident);
router.get('/:projectId/incidents', checkProjectAccess, reportController.listIncidents);

router.post(
  '/:projectId/incidents',
  checkProjectAccess,
  parser,
  uploadAndCompressImages,
  validate(createIncidentSchema),
  reportController.logIncident
);

router.put(
  '/incidents/:id',
  authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  parser,
  uploadAndCompressImages,
  validate(updateIncidentSchema),
  reportController.updateIncident
);

// --- Daily Site Reports ---
router.get('/reports/:id', reportController.getDailyReport);
router.get('/:projectId/reports', checkProjectAccess, reportController.listDailyReports);

router.post(
  '/:projectId/reports',
  checkProjectAccess,
  authorize(ROLES.ADMIN, ROLES.PROJECT_MANAGER),
  validate(createDailyReportSchema),
  reportController.compileDailyReport
);

// --- AI Insights ---
router.get('/:projectId/insights', checkProjectAccess, reportController.listInsights);

module.exports = router;
