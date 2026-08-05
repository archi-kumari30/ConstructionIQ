const request = require('supertest');
const app = require('../app');
const dailySiteReportRepository = require('../repositories/dailySiteReportRepository');
const incidentRepository = require('../repositories/incidentRepository');
const aiInsightRepository = require('../repositories/aiInsightRepository');
const projectRepository = require('../repositories/projectRepository');
const projectTeamRepository = require('../repositories/projectTeamRepository');
const userRepository = require('../repositories/userRepository');
const auditLogService = require('../services/auditLogService');
const reportQueue = require('../jobs/reportQueue');
const socketService = require('../socket/socketService');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const mongoose = require('mongoose');

// Mock dependencies
jest.mock('../repositories/dailySiteReportRepository');
jest.mock('../repositories/incidentRepository');
jest.mock('../repositories/aiInsightRepository');
jest.mock('../repositories/projectRepository');
jest.mock('../repositories/projectTeamRepository');
jest.mock('../repositories/userRepository');
jest.mock('../services/auditLogService');
jest.mock('../jobs/reportQueue');
jest.mock('../socket/socketService');

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
    status: 'reported',
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
});
