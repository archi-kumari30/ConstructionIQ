/**
 * ConstructionIQ Statuses constant
 */
const STATUS = {
  PROJECT: {
    PLANNING: 'planning',
    ACTIVE: 'active',
    DELAYED: 'delayed',
    ON_HOLD: 'on_hold',
    COMPLETED: 'completed'
  },
  MILESTONE: {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    DELAYED: 'delayed'
  },
  MATERIAL_REQUEST: {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    FULFILLED: 'fulfilled'
  },
  MATERIAL_TRANSACTION: {
    RECEIVED: 'received',
    ISSUED: 'issued',
    RETURNED: 'returned'
  },
  EQUIPMENT: {
    AVAILABLE: 'available',
    IN_USE: 'in_use',
    UNDER_MAINTENANCE: 'under_maintenance'
  },
  EQUIPMENT_BOOKING: {
    BOOKED: 'booked',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
  },
  ATTENDANCE: {
    PRESENT: 'present',
    ABSENT: 'absent',
    HALF_DAY: 'half_day',
    LEAVE: 'leave'
  },
  DELIVERY: {
    SCHEDULED: 'scheduled',
    IN_TRANSIT: 'in_transit',
    DELIVERED: 'delivered',
    DELAYED: 'delayed',
    CANCELLED: 'cancelled'
  },
  BUDGET_CATEGORY: {
    MATERIAL: 'material',
    EQUIPMENT: 'equipment',
    LABOR: 'labor',
    OTHER: 'other'
  },
  INCIDENT: {
    OPEN: 'open',
    INVESTIGATING: 'investigating',
    RESOLVED: 'resolved'
  },
  SEVERITY: {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    CRITICAL: 'critical'
  },
  AI_INSIGHT: {
    DELAY_PREDICTION: 'delay_prediction',
    COST_ANOMALY: 'cost_anomaly',
    DUPLICATE_REQUEST: 'duplicate_request',
    ASSISTANT_QUERY: 'assistant_query'
  }
};

module.exports = STATUS;
