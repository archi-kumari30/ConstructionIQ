import { jest } from '@jest/globals';

const createMockModule = () => new Proxy({}, {
  get(target, key) {
    if (!(key in target)) target[key] = jest.fn();
    return target[key];
  }
});


// Mock dependencies
jest.unstable_mockModule('../repositories/dailySiteReportRepository.js', () => ({ default: createMockModule() }));
jest.unstable_mockModule('../repositories/incidentRepository.js', () => ({ default: createMockModule() }));
jest.unstable_mockModule('../repositories/aiInsightRepository.js', () => ({ default: createMockModule() }));
jest.unstable_mockModule('../repositories/projectRepository.js', () => ({ default: createMockModule() }));
jest.unstable_mockModule('../repositories/projectTeamRepository.js', () => ({ default: createMockModule() }));
jest.unstable_mockModule('../repositories/userRepository.js', () => ({ default: createMockModule() }));
jest.unstable_mockModule('../services/auditLogService.js', () => ({ default: createMockModule() }));
jest.unstable_mockModule('../jobs/reportQueue.js', () => ({ default: createMockModule() }));
jest.unstable_mockModule('../socket/socketService.js', () => ({ default: createMockModule() }));

const request = (await import('supertest')).default;
const app = (await import('../app.js')).default;
const dailySiteReportRepository = (await import('../repositories/dailySiteReportRepository.js')).default;
const incidentRepository = (await import('../repositories/incidentRepository.js')).default;
const aiInsightRepository = (await import('../repositories/aiInsightRepository.js')).default;
const projectRepository = (await import('../repositories/projectRepository.js')).default;
const projectTeamRepository = (await import('../repositories/projectTeamRepository.js')).default;
const userRepository = (await import('../repositories/userRepository.js')).default;
const auditLogService = (await import('../services/auditLogService.js')).default;
const reportQueue = (await import('../jobs/reportQueue.js')).default;
const socketService = (await import('../socket/socketService.js')).default;
const jwt = (await import('jsonwebtoken')).default;
const jwtConfig = (await import('../config/jwt.js')).default;
const mongoose = (await import('mongoose')).default;

describe('Operations Reporting, Incidents & AI Audits API tests', () => {
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
  
  const mockIncident = {
    _id: '60d0fe4f5311236168a109i1',
    projectId,
    reportedBy: engineerUser._id,
    title: 'Excavator Hydraulic Leak',
    description: 'Minor hydraulic fluid leak detected on site excavator.',
    severity: 'medium',
    status: 'open',
    images: [],
    save: jest.fn().mockImplementation(function() { return this; })
  };

  const mockReport = {
    _id: '60d0fe4f5311236168a109r1',
    projectId,
    date: new Date('2026-09-01T00:00:00.000Z'),
    compiledBy: pmUser._id,
    notes: 'Operational day summary.',
    materialsUsed: [],
    equipmentHours: [],
    laborHeadcount: 15,
    incidentCount: 1,
    pdfUrl: null,
    save: jest.fn().mockImplementation(function() { return this; })
  };

  const mockInsight = {
    _id: '60d0fe4f5311236168a109t1',
    projectId,
    date: new Date('2026-09-01T00:00:00.000Z'),
    type: 'safety_audit',
    summary: 'Site safety rating is high with zero critical incidents this week.',
    recommendations: ['Maintain site barrier checklists.'],
    confidenceScore: 0.95
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

    // Mock startSession to prevent hanging
    jest.spyOn(mongoose, 'startSession').mockResolvedValue({
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn()
    });
  });

  describe('Incidents logging and safety alerts', () => {
    it('should successfully log safety incident details', async () => {
      incidentRepository.create.mockResolvedValue(mockIncident);

      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/incidents`)
        .set('Authorization', `Bearer ${engineerToken}`)
        .send({
          title: 'Excavator Hydraulic Leak',
          description: 'Minor hydraulic fluid leak detected on site excavator.',
          severity: 'medium'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(mockIncident.title);
      expect(incidentRepository.create).toHaveBeenCalled();
    });

    it('should trigger safety socket alerts when high severity incident is logged', async () => {
      const highSeverityIncident = {
        ...mockIncident,
        _id: 'high123',
        severity: 'high'
      };
      
      incidentRepository.create.mockResolvedValue(highSeverityIncident);

      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/incidents`)
        .set('Authorization', `Bearer ${engineerToken}`)
        .send({
          title: 'Trench Cave-in Threat',
          description: 'Slight shift in shoring boards observed in Zone B.',
          severity: 'high'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      
      // Verification: safety alarm socket event sent
      expect(socketService.emitToProject).toHaveBeenCalledWith(
        projectId,
        'critical_safety_incident',
        expect.objectContaining({
          severity: 'high'
        })
      );
    });
  });

  describe('Daily Site Reports & Async PDF Queuing', () => {
    it('should successfully compile daily report and normalize date to midnight', async () => {
      dailySiteReportRepository.findByProjectAndDate.mockResolvedValue(null); // No duplicates
      dailySiteReportRepository.create.mockResolvedValue(mockReport);
      
      // Simulate queue successfully adding job
      reportQueue.add.mockResolvedValue({ id: 'job123' });

      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/reports`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({
          date: '2026-09-01T15:00:00Z',
          notes: 'Completed concrete foundation pouring.',
          laborHeadcount: 15,
          incidentCount: 1
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      
      // Date normalization to UTC Midnight check
      expect(dailySiteReportRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          date: new Date('2026-09-01T00:00:00.000Z')
        })
      );
      
      // BullMQ enqueued check
      expect(reportQueue.add).toHaveBeenCalled();
    });

    it('should fall back gracefully to local setTimeout compilation if Redis queue addition fails', async () => {
      dailySiteReportRepository.findByProjectAndDate.mockResolvedValue(null);
      dailySiteReportRepository.create.mockResolvedValue(mockReport);
      
      // Simulate Redis server offline
      reportQueue.add.mockRejectedValue(new Error('Redis connection refused'));
      dailySiteReportRepository.updatePdfUrl.mockResolvedValue({});

      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/reports`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({
          date: '2026-09-01',
          notes: 'Completed structural framing work.',
          laborHeadcount: 20
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      
      // Wait for local fallback setTimeout (50ms) to complete
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // Verification: local fallback compiler processed and saved details
      expect(dailySiteReportRepository.updatePdfUrl).toHaveBeenCalledWith(mockReport._id, expect.stringContaining('.pdf'));
      expect(socketService.emitToProject).toHaveBeenCalledWith(
        projectId,
        'report_compiled',
        expect.objectContaining({
          reportId: mockReport._id
        })
      );
    });

    it('should reject compiling daily site reports twice for same project and day', async () => {
      dailySiteReportRepository.findByProjectAndDate.mockResolvedValue(mockReport); // Duplicate exists

      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/reports`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({
          date: '2026-09-01',
          notes: 'Completed electrical wirings.'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('compiled');
    });
  });

  describe('AI Forecast Audit Summary Insights', () => {
    it('should successfully list AI forecasting reports', async () => {
      aiInsightRepository.findByProject.mockResolvedValue({
        data: [mockInsight],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1
      });

      const res = await request(app)
        .get(`/api/v1/projects/${projectId}/insights`)
        .set('Authorization', `Bearer ${pmToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.insights[0].type).toBe(mockInsight.type);
    });
  });

  describe('IDOR / Project Access Boundaries for Incidents & Reports', () => {
    const alienUser = { _id: '60d0fe4f5311236168a109dd', name: 'Alien PM', email: 'alien@test.com', role: 'project_manager', isActive: true };
    const alienToken = jwt.sign({ id: alienUser._id, role: alienUser.role, email: alienUser.email }, jwtConfig.accessSecret);

    beforeEach(() => {
      userRepository.findById.mockImplementation(async (id) => {
        if (id === adminUser._id) return adminUser;
        if (id === pmUser._id) return pmUser;
        if (id === engineerUser._id) return engineerUser;
        if (id === alienUser._id) return alienUser;
        return null;
      });
    });

    it('should block GET /reports/:id if user is not on project team', async () => {
      dailySiteReportRepository.findById.mockResolvedValue(mockReport);
      projectRepository.findById.mockResolvedValue({ _id: projectId, name: 'Metropolis Tower', managerId: pmUser._id });
      projectTeamRepository.isUserOnProjectTeam.mockResolvedValue(false);

      const res = await request(app)
        .get(`/api/v1/projects/reports/${mockReport._id}`)
        .set('Authorization', `Bearer ${alienToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should permit GET /reports/:id if user is admin', async () => {
      dailySiteReportRepository.findById.mockResolvedValue(mockReport);

      const res = await request(app)
        .get(`/api/v1/projects/reports/${mockReport._id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should block GET /incidents/:id if user is not on project team', async () => {
      incidentRepository.findById.mockResolvedValue(mockIncident);
      projectRepository.findById.mockResolvedValue({ _id: projectId, name: 'Metropolis Tower', managerId: pmUser._id });
      projectTeamRepository.isUserOnProjectTeam.mockResolvedValue(false);

      const res = await request(app)
        .get(`/api/v1/projects/incidents/${mockIncident._id}`)
        .set('Authorization', `Bearer ${alienToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should block PUT /incidents/:id if user is not on project team', async () => {
      incidentRepository.findByIdRaw.mockResolvedValue(mockIncident);
      projectRepository.findById.mockResolvedValue({ _id: projectId, name: 'Metropolis Tower', managerId: pmUser._id });
      projectTeamRepository.isUserOnProjectTeam.mockResolvedValue(false);

      const res = await request(app)
        .put(`/api/v1/projects/incidents/${mockIncident._id}`)
        .set('Authorization', `Bearer ${alienToken}`)
        .send({ title: 'New title' });

      expect(res.status).toBe(403);
    });
  });
});
