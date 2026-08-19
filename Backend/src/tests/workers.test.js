import { jest } from '@jest/globals';

const createMockModule = () => new Proxy({}, {
  get(target, key) {
    if (!(key in target)) target[key] = jest.fn();
    return target[key];
  }
});


// Mock dependencies
jest.unstable_mockModule('../repositories/workerRepository.js', () => ({ default: createMockModule() }));
jest.unstable_mockModule('../repositories/attendanceRepository.js', () => ({ default: createMockModule() }));
jest.unstable_mockModule('../repositories/projectRepository.js', () => ({ default: createMockModule() }));
jest.unstable_mockModule('../repositories/projectTeamRepository.js', () => ({ default: createMockModule() }));
jest.unstable_mockModule('../repositories/userRepository.js', () => ({ default: createMockModule() }));
jest.unstable_mockModule('../services/auditLogService.js', () => ({ default: createMockModule() }));

const request = (await import('supertest')).default;
const app = (await import('../app.js')).default;
const workerRepository = (await import('../repositories/workerRepository.js')).default;
const attendanceRepository = (await import('../repositories/attendanceRepository.js')).default;
const projectRepository = (await import('../repositories/projectRepository.js')).default;
const projectTeamRepository = (await import('../repositories/projectTeamRepository.js')).default;
const userRepository = (await import('../repositories/userRepository.js')).default;
const auditLogService = (await import('../services/auditLogService.js')).default;
const jwt = (await import('jsonwebtoken')).default;
const jwtConfig = (await import('../config/jwt.js')).default;

describe('Workforce Labor & Attendance Endpoints API tests', () => {
  // Mock User Profiles
  const adminUser = { _id: '60d0fe4f5311236168a109aa', name: 'Admin User', email: 'admin@test.com', role: 'admin', isActive: true };
  const pmUser = { _id: '60d0fe4f5311236168a109bb', name: 'Project Manager', email: 'pm@test.com', role: 'project_manager', isActive: true };
  const contractor1 = { _id: '60d0fe4f5311236168a109c1', name: 'Contractor One', email: 'c1@test.com', role: 'contractor', isActive: true };
  const contractor2 = { _id: '60d0fe4f5311236168a109c2', name: 'Contractor Two', email: 'c2@test.com', role: 'contractor', isActive: true };
  const engineerUser = { _id: '60d0fe4f5311236168a109ee', name: 'Site Engineer', email: 'eng@test.com', role: 'site_engineer', isActive: true };

  // Tokens
  const adminToken = jwt.sign({ id: adminUser._id, role: adminUser.role, email: adminUser.email }, jwtConfig.accessSecret);
  const pmToken = jwt.sign({ id: pmUser._id, role: pmUser.role, email: pmUser.email }, jwtConfig.accessSecret);
  const contractor1Token = jwt.sign({ id: contractor1._id, role: contractor1.role, email: contractor1.email }, jwtConfig.accessSecret);
  const contractor2Token = jwt.sign({ id: contractor2._id, role: contractor2.role, email: contractor2.email }, jwtConfig.accessSecret);

  // Mock Objects
  const projectId = '60d0fe4f5311236168a109ef';
  const mockWorker = {
    _id: '60d0fe4f5311236168a109d1',
    name: 'John Doe',
    contractorId: contractor1._id,
    role: 'mason',
    contact: '1234567890',
    isDeleted: false,
    save: jest.fn().mockImplementation(function() { return this; })
  };

  const mockAttendance = {
    _id: '60d0fe4f5311236168a109e1',
    workerId: mockWorker._id,
    projectId,
    date: new Date('2026-09-01T00:00:00.000Z'),
    status: 'present',
    overtimeHours: 0,
    save: jest.fn().mockImplementation(function() { return this; })
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Default JWT auth resolves active user
    userRepository.findById.mockImplementation(async (id) => {
      if (id === adminUser._id) return adminUser;
      if (id === pmUser._id) return pmUser;
      if (id === contractor1._id) return contractor1;
      if (id === contractor2._id) return contractor2;
      if (id === engineerUser._id) return engineerUser;
      return null;
    });

    // Default project and team checks pass
    projectRepository.findById.mockResolvedValue({ _id: projectId, name: 'Metropolis Tower', managerId: pmUser._id });
    projectTeamRepository.isUserOnProjectTeam.mockResolvedValue(true);
    auditLogService.logAction.mockResolvedValue({});
  });

  describe('Workforce Labor CRUD Scopes', () => {
    it('should allow Admin to create a worker under any contractor', async () => {
      workerRepository.create.mockResolvedValue(mockWorker);

      const res = await request(app)
        .post('/api/v1/workers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'John Doe',
          contractorId: contractor1._id.toString(),
          role: 'mason'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(mockWorker.name);
    });

    it('should allow Contractor to create a worker under their own contractor id', async () => {
      workerRepository.create.mockResolvedValue(mockWorker);

      const res = await request(app)
        .post('/api/v1/workers')
        .set('Authorization', `Bearer ${contractor1Token}`)
        .send({
          name: 'John Doe',
          contractorId: contractor1._id.toString(),
          role: 'mason'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should reject Contractor from creating a worker under another contractor id', async () => {
      const res = await request(app)
        .post('/api/v1/workers')
        .set('Authorization', `Bearer ${contractor1Token}`)
        .send({
          name: 'Jane Doe',
          contractorId: contractor2._id.toString(),
          role: 'electrician'
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('workforce');
    });

    it('should allow Contractor to update their own worker details', async () => {
      workerRepository.findByIdRaw.mockResolvedValue(mockWorker);
      workerRepository.update.mockResolvedValue({ ...mockWorker, role: 'foreman' });

      const res = await request(app)
        .put(`/api/v1/workers/${mockWorker._id}`)
        .set('Authorization', `Bearer ${contractor1Token}`)
        .send({ role: 'foreman' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('foreman');
    });

    it('should prevent Contractor from updating another contractor\'s worker', async () => {
      workerRepository.findByIdRaw.mockResolvedValue(mockWorker); // Belongs to contractor1

      const res = await request(app)
        .put(`/api/v1/workers/${mockWorker._id}`)
        .set('Authorization', `Bearer ${contractor2Token}`) // Contractor 2 attempts edit
        .send({ role: 'foreman' });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/v1/projects/:projectId/attendance (Attendance Logs)', () => {
    it('should log attendance successfully and normalize date to midnight', async () => {
      workerRepository.findById.mockResolvedValue(mockWorker);
      attendanceRepository.findByWorkerProjectDate.mockResolvedValue(null); // No duplicates
      attendanceRepository.create.mockResolvedValue(mockAttendance);

      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/attendance`)
        .set('Authorization', `Bearer ${contractor1Token}`)
        .send({
          workerId: mockWorker._id,
          date: '2026-09-01T14:30:00Z', // Submitted with time
          status: 'present'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      
      // Verification: service normalized to midnight
      expect(attendanceRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          date: new Date('2026-09-01T00:00:00.000Z')
        })
      );
    });

    it('should prevent logging attendance twice for the same worker on same project and day', async () => {
      workerRepository.findById.mockResolvedValue(mockWorker);
      
      // Simulate existing attendance record on same day
      attendanceRepository.findByWorkerProjectDate.mockResolvedValue(mockAttendance);

      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/attendance`)
        .set('Authorization', `Bearer ${contractor1Token}`)
        .send({
          workerId: mockWorker._id,
          date: '2026-09-01',
          status: 'present'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Attendance already logged');
    });
  });
});
