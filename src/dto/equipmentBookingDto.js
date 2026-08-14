import EquipmentDto from './equipmentDto.js';

/**
 * Equipment Booking Data Transfer Object
 */
class EquipmentBookingDto {
  static toResponse(booking) {
    if (!booking) return null;
    return {
      id: booking._id || booking.id,
      equipment: EquipmentDto.toResponse(booking.equipmentId),
      projectId: booking.projectId._id || booking.projectId.id || booking.projectId,
      projectName: booking.projectId?.name || null,
      bookedBy: booking.bookedBy ? {
        id: booking.bookedBy._id || booking.bookedBy.id || booking.bookedBy,
        name: booking.bookedBy.name || null,
        email: booking.bookedBy.email || null
      } : null,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt
    };
  }

  static toResponseList(bookings) {
    if (!Array.isArray(bookings)) return [];
    return bookings.map(b => this.toResponse(b));
  }
}

export default EquipmentBookingDto;
