import equipmentRepository from '../repositories/equipmentRepository.js';
import equipmentBookingRepository from '../repositories/equipmentBookingRepository.js';
import equipmentUsageLogRepository from '../repositories/equipmentUsageLogRepository.js';
import auditLogService from './auditLogService.js';
import projectService from './projectService.js';
import { ConflictError, BadRequestError, NotFoundError } from '../utils/customErrors.js';
import logger from '../config/logger.js';
import STATUS from '../constants/status.js';

class EquipmentService {
  // --- Global Fleet CRUD ---
  async createEquipment(equipmentData, userId) {
    const equipment = await equipmentRepository.create(equipmentData);

    await auditLogService.logAction({
      userId,
      action: 'EQUIPMENT_FLEET_CREATE',
      entity: 'Equipment',
      entityId: equipment._id,
      details: { name: equipment.name, type: equipment.type }
    });

    return equipment;
  }

  async updateEquipment(id, updateData, userId) {
    const equipment = await equipmentRepository.update(id, updateData);
    if (!equipment) {
      throw new NotFoundError('Equipment not found in fleet');
    }

    await auditLogService.logAction({
      userId,
      action: 'EQUIPMENT_FLEET_UPDATE',
      entity: 'Equipment',
      entityId: equipment._id,
      details: updateData
    });

    return equipment;
  }

  async deleteEquipment(id, userId) {
    const equipment = await equipmentRepository.softDelete(id);
    if (!equipment) {
      throw new NotFoundError('Equipment not found in fleet');
    }

    await auditLogService.logAction({
      userId,
      action: 'EQUIPMENT_FLEET_DELETE',
      entity: 'Equipment',
      entityId: equipment._id
    });

    return equipment;
  }

  async getEquipmentById(id) {
    const equipment = await equipmentRepository.findById(id);
    if (!equipment) {
      throw new NotFoundError('Equipment not found');
    }
    return equipment;
  }

  async listEquipment(params) {
    return await equipmentRepository.findAll(params);
  }

  // --- Booking Operations ---
  async createBooking(projectId, bookingData, userId) {
    const { equipmentId, startTime, endTime } = bookingData;

    // Verify equipment exists
    const equipment = await equipmentRepository.findByIdRaw(equipmentId);
    if (!equipment) {
      throw new NotFoundError('Equipment not found in fleet');
    }

    if (equipment.status === STATUS.EQUIPMENT.UNDER_MAINTENANCE) {
      throw new BadRequestError('Cannot book equipment currently under maintenance');
    }

    // Conflict Check: overlapping bookings
    const conflicts = await equipmentBookingRepository.findOverlappingBookings(equipmentId, startTime, endTime);
    if (conflicts.length > 0) {
      const conflictedProject = conflicts[0].projectId.name || 'another project';
      throw new ConflictError(`Scheduling conflict: Equipment is already booked by ${conflictedProject} for this time slot`);
    }

    const booking = await equipmentBookingRepository.create({
      ...bookingData,
      projectId,
      bookedBy: userId,
      status: STATUS.EQUIPMENT_BOOKING.BOOKED
    });

    await auditLogService.logAction({
      userId,
      action: 'EQUIPMENT_BOOKING_CREATE',
      entity: 'EquipmentBooking',
      entityId: booking._id,
      details: { projectId, startTime, endTime }
    });

    return booking;
  }

  async updateBookingStatus(bookingId, status, user) {
    const booking = await equipmentBookingRepository.findByIdRaw(bookingId);
    if (!booking) {
      throw new NotFoundError('Equipment booking not found');
    }

    // Verify project access boundaries
    await projectService.validateProjectAccess(booking.projectId, user);

    const oldStatus = booking.status;
    if (oldStatus === status) {
      return booking;
    }

    booking.status = status;
    await booking.save();

    // Adjust global equipment status based on booking status transitions
    const equipment = await equipmentRepository.findByIdRaw(booking.equipmentId);
    if (equipment) {
      if (status === STATUS.EQUIPMENT_BOOKING.IN_PROGRESS) {
        equipment.status = STATUS.EQUIPMENT.IN_USE;
        await equipment.save();
      } else if (
        status === STATUS.EQUIPMENT_BOOKING.COMPLETED ||
        status === STATUS.EQUIPMENT_BOOKING.CANCELLED
      ) {
        // Only set back to available if no other active "in_progress" booking is currently running for this equipment
        const activeBookings = await equipmentBookingRepository.findOverlappingBookings(
          booking.equipmentId,
          new Date(),
          new Date(Date.now() + 60000), // Check currently active bookings
          booking._id
        );
        
        const hasOtherActive = activeBookings.some(b => b.status === STATUS.EQUIPMENT_BOOKING.IN_PROGRESS);
        if (!hasOtherActive) {
          equipment.status = STATUS.EQUIPMENT.AVAILABLE;
          await equipment.save();
        }
      }
    }

    await auditLogService.logAction({
      userId: user._id,
      action: `EQUIPMENT_BOOKING_${status.toUpperCase()}`,
      entity: 'EquipmentBooking',
      entityId: booking._id,
      details: { oldStatus, newStatus: status }
    });

    return await equipmentBookingRepository.findById(bookingId);
  }

  async listBookings(projectId, params) {
    return await equipmentBookingRepository.findByProject(projectId, params);
  }

  async listEquipmentBookings(equipmentId, params) {
    return await equipmentBookingRepository.findByEquipment(equipmentId, params);
  }

  // --- Telemetry / Usage Logging ---
  async logUsage(projectId, usageData, userId) {
    const { equipmentId, date, hoursUsed, fuelUsedLiters } = usageData;

    // Verify equipment
    const equipment = await equipmentRepository.findById(equipmentId);
    if (!equipment) {
      throw new NotFoundError('Equipment not found in fleet');
    }

    const log = await equipmentUsageLogRepository.create({
      ...usageData,
      projectId
    });

    await auditLogService.logAction({
      userId,
      action: 'EQUIPMENT_TELEMETRY_LOG',
      entity: 'EquipmentUsageLog',
      entityId: log._id,
      details: { projectId, hoursUsed, fuelUsedLiters }
    });

    return log;
  }

  async listUsageLogs(projectId, params) {
    return await equipmentUsageLogRepository.findByProject(projectId, params);
  }
}

export default new EquipmentService();
