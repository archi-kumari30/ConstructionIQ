/**
 * ConstructionIQ Permissions constant
 */
const PERMISSIONS = {
  // Projects
  PROJECT_CREATE: 'project:create',
  PROJECT_READ: 'project:read',
  PROJECT_UPDATE: 'project:update',
  PROJECT_DELETE: 'project:delete',

  // Project Milestones
  MILESTONE_CREATE: 'milestone:create',
  MILESTONE_READ: 'milestone:read',
  MILESTONE_UPDATE: 'milestone:update',
  MILESTONE_DELETE: 'milestone:delete',

  // Materials & Catalog
  MATERIAL_CREATE: 'material:create',
  MATERIAL_READ: 'material:read',
  MATERIAL_UPDATE: 'material:update',
  MATERIAL_DELETE: 'material:delete',

  // Material Inventory
  INVENTORY_READ: 'inventory:read',
  INVENTORY_UPDATE: 'inventory:update',

  // Material Requests
  REQUEST_CREATE: 'request:create',
  REQUEST_READ: 'request:read',
  REQUEST_APPROVE: 'request:approve',
  REQUEST_FULFILL: 'request:fulfill',

  // Equipment
  EQUIPMENT_CREATE: 'equipment:create',
  EQUIPMENT_READ: 'equipment:read',
  EQUIPMENT_UPDATE: 'equipment:update',
  EQUIPMENT_DELETE: 'equipment:delete',
  EQUIPMENT_BOOK: 'equipment:book',

  // Workers & Attendance
  WORKER_CREATE: 'worker:create',
  WORKER_READ: 'worker:read',
  WORKER_UPDATE: 'worker:update',
  WORKER_DELETE: 'worker:delete',
  ATTENDANCE_LOG: 'attendance:log',
  ATTENDANCE_READ: 'attendance:read',

  // Deliveries
  DELIVERY_CREATE: 'delivery:create',
  DELIVERY_READ: 'delivery:read',
  DELIVERY_UPDATE: 'delivery:update',

  // Financials
  BUDGET_MANAGE: 'budget:manage',
  BUDGET_READ: 'budget:read',
  EXPENSE_CREATE: 'expense:create',
  EXPENSE_READ: 'expense:read',

  // Incidents
  INCIDENT_REPORT: 'incident:report',
  INCIDENT_READ: 'incident:read',
  INCIDENT_RESOLVE: 'incident:resolve',

  // Reports & Auditing
  REPORT_CREATE: 'report:create',
  REPORT_READ: 'report:read',
  AUDIT_LOG_READ: 'audit:read'
};

export default PERMISSIONS;
