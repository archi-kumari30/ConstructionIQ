const request = require('supertest');
const app = require('../app');
const equipmentRepository = require('../repositories/equipmentRepository');
const equipmentBookingRepository = require('../repositories/equipmentBookingRepository');
const equipmentUsageLogRepository = require('../repositories/equipmentUsageLogRepository');
const projectRepository = require('../repositories/projectRepository');
const projectTeamRepository = require('../repositories/projectTeamRepository');
const userRepository = require('../repositories/userRepository');
const auditLogService = require('../services/auditLogService');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const mongoose = require('mongoose');

// Mock dependencies
jest.mock('../repositories/equipmentRepository');
jest.mock('../repositories/equipmentBookingRepository');
jest.mock('../repositories/equipmentUsageLogRepository');
jest.mock('../repositories/projectRepository');
jest.mock('../repositories/projectTeamRepository');
jest.mock('../repositories/userRepository');
jest.mock('../services/auditLogService');

describe('Equipment Fleet & Bookings Endpoints API tests', () => {
  // Mock User Profiles
  const adminUser = { _id: '60d0fe4f5311236168a109aa', name: 'Admin User', email: 'admin@test.com', role: 'admin', isActive: true };
  const pmUser = { _id: '60d0fe4f5311236168a109bb', name: 'Project Manager', email: 'pm@test.com', role: 'project_manager', isActive: true };
  const engineerUser = { _id: '60d0fe4f5311236168a109cc', name: 'Site Engineer', email: 'eng@test.com', role: 'site_engineer', isActive: true };

  // Tokens
  const adminToken = jwt.sign({ id: adminUser._id, role: adminUser.role, email: adminUser.email }, jwtConfig.accessSecret);
  const pmToken = jwt.sign({ id: pmUser._id, role: pmUser.role, email: pmUser.email }, jwtConfig.accessSecret);
  const engineerToken = jwt.sign({ id: engineerUser._id, role: engineerUser.role, email: engineerUser.email }, jwtConfig.accessSecret);

  // Mock Objects
  const projectId = '60d0fe4f5311236168a109ee';
  const mockEquipment = {
    _id: '60d0fe4f5311236168a109a1',
    name: 'Caterpillar 320 Excavator',
    type: 'excavator',
    status: 'available',
    isDeleted: false,
    save: jest.fn().mockImplementation(function() { return this; })
  };

  const mockBooking = {
    _id: '60d0fe4f5311236168a109b1',
    equipmentId: mockEquipment._id,
    projectId,
    bookedBy: pmUser._id,
    startTime: new Date('2026-09-01T08:00:00Z'),
    endTime: new Date('2026-09-01T17:00:00Z'),
    status: 'booked',
    save: jest.fn().mockImplementation(function() { return this; })
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default JWT auth resolves active user
    userRepository.findById.mockImplementation(async (id) => {
      if (id === adminUser._id) return adminUser;
      if (id === pmUser._id) return pmUser;
      if (id === engineerUser._id) return engineerUser;
      return null;
    });

    // Default project and team checks pass
    projectRepository.findById.mockResolvedValue({ _id: projectId, name: 'Metropolis Tower', managerId: pmUser._id });
    projectTeamRepository.isUserOnProjectTeam.mockResolvedValue(true);
    auditLogService.logAction.mockResolvedValue({});
  });

  describe('Global Fleet CRUD', () => {
    it('should allow Admin to create new equipment', async () => {
      equipmentRepository.create.mockResolvedValue(mockEquipment);

      const res = await request(app)
        .post('/api/v1/equipment')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Caterpillar 320 Excavator',
          type: 'excavator'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(mockEquipment.name);
    });

    it('should block non-admins from creating equipment', async () => {
      const res = await request(app)
        .post('/api/v1/equipment')
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ name: 'Cat 320', type: 'excavator' });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/v1/projects/:projectId/bookings (Equipment Bookings)', () => {
    const payload = {
      equipmentId: mockEquipment._id,
      startTime: '2026-09-01T08:00:00Z',
      endTime: '2026-09-01T17:00:00Z'
    };

    it('should successfully book equipment when available and no overlaps', async () => {
      equipmentRepository.findByIdRaw.mockResolvedValue(mockEquipment);
      equipmentBookingRepository.findOverlappingBookings.mockResolvedValue([]); // no conflicts
      equipmentBookingRepository.create.mockResolvedValue(mockBooking);

      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/bookings`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('booked');
    });

    it('should prevent booking when equipment is under maintenance', async () => {
      const maintenanceEquipment = { ...mockEquipment, status: 'under_maintenance' };
      equipmentRepository.findByIdRaw.mockResolvedValue(maintenanceEquipment);

      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/bookings`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('maintenance');
    });

    it('should reject booking when scheduling conflicts exist', async () => {
      equipmentRepository.findByIdRaw.mockResolvedValue(mockEquipment);
      
      // Simulate overlapping booking on metropolis project
      equipmentBookingRepository.findOverlappingBookings.mockResolvedValue([
        { _id: 'otherBookingId', projectId: { name: 'Metro Project' }, status: 'booked' }
      ]);

      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/bookings`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send(payload);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('conflict');
    });
  });

  describe('PUT /api/v1/equipment/bookings/:id/status (Booking Transitions)', () => {
    it('should set equipment status to in_use when booking status changes to in_progress', async () => {
      equipmentBookingRepository.findByIdRaw.mockResolvedValue(mockBooking);
      equipmentRepository.findByIdRaw.mockResolvedValue(mockEquipment);
      equipmentBookingRepository.findById.mockResolvedValue({
        ...mockBooking,
        status: 'in_progress'
      });

      const res = await request(app)
        .put(`/api/v1/equipment/bookings/${mockBooking._id}/status`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ status: 'in_progress' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('in_progress');
      expect(mockEquipment.save).toHaveBeenCalled();
      expect(mockEquipment.status).toBe('in_use');
    });

    it('should set equipment status back to available when booking is completed or cancelled', async () => {
      const activeBooking = { ...mockBooking, status: 'in_progress' };
      equipmentBookingRepository.findByIdRaw.mockResolvedValue(activeBooking);
      
      const inUseEquipment = { ...mockEquipment, status: 'in_use', save: jest.fn() };
      equipmentRepository.findByIdRaw.mockResolvedValue(inUseEquipment);
      
      equipmentBookingRepository.findOverlappingBookings.mockResolvedValue([]); // no other active bookings
      equipmentBookingRepository.findById.mockResolvedValue({
        ...activeBooking,
        status: 'completed'
      });

      const res = await request(app)
        .put(`/api/v1/equipment/bookings/${mockBooking._id}/status`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ status: 'completed' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('completed');
      expect(inUseEquipment.save).toHaveBeenCalled();
      expect(inUseEquipment.status).toBe('available');
    });
  });

  describe('POST /api/v1/projects/:projectId/telemetry (Fleet Telemetry)', () => {
    it('should allow site engineers to log daily machine telemetry metrics', async () => {
      equipmentRepository.findById.mockResolvedValue(mockEquipment);
      equipmentUsageLogRepository.create.mockResolvedValue({
        _id: 'log123',
        equipmentId: mockEquipment._id,
        projectId,
        date: new Date('2026-09-01'),
        hoursUsed: 6.5,
        fuelUsedLiters: 45.2
      });

      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/telemetry`)
        .set('Authorization', `Bearer ${engineerToken}`)
        .send({
          equipmentId: mockEquipment._id,
          date: '2026-09-01',
          hoursUsed: 6.5,
          fuelUsedLiters: 45.2
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hoursUsed).toBe(6.5);
      expect(equipmentUsageLogRepository.create).toHaveBeenCalled();
    });
  });
});
