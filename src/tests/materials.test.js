import { jest } from '@jest/globals';

const createMockModule = () => new Proxy({}, {
  get(target, key) {
    if (!(key in target)) target[key] = jest.fn();
    return target[key];
  }
});


// Mock dependencies
jest.unstable_mockModule('../repositories/materialRepository.js', () => ({ default: createMockModule() }));
jest.unstable_mockModule('../repositories/materialInventoryRepository.js', () => ({ default: createMockModule() }));
jest.unstable_mockModule('../repositories/materialRequestRepository.js', () => ({ default: createMockModule() }));
jest.unstable_mockModule('../repositories/materialTransactionRepository.js', () => ({ default: createMockModule() }));
jest.unstable_mockModule('../repositories/projectTeamRepository.js', () => ({ default: createMockModule() }));
jest.unstable_mockModule('../repositories/notificationRepository.js', () => ({ default: createMockModule() }));
jest.unstable_mockModule('../socket/socketService.js', () => ({ default: createMockModule() }));
jest.unstable_mockModule('../services/auditLogService.js', () => ({ default: createMockModule() }));
jest.unstable_mockModule('../repositories/userRepository.js', () => ({ default: createMockModule() }));
jest.unstable_mockModule('../repositories/projectRepository.js', () => ({ default: createMockModule() }));

const request = (await import('supertest')).default;
const app = (await import('../app.js')).default;
const materialRepository = (await import('../repositories/materialRepository.js')).default;
const materialInventoryRepository = (await import('../repositories/materialInventoryRepository.js')).default;
const materialRequestRepository = (await import('../repositories/materialRequestRepository.js')).default;
const materialTransactionRepository = (await import('../repositories/materialTransactionRepository.js')).default;
const projectTeamRepository = (await import('../repositories/projectTeamRepository.js')).default;
const notificationRepository = (await import('../repositories/notificationRepository.js')).default;
const socketService = (await import('../socket/socketService.js')).default;
const auditLogService = (await import('../services/auditLogService.js')).default;
const jwt = (await import('jsonwebtoken')).default;
const userRepository = (await import('../repositories/userRepository.js')).default;
const projectRepository = (await import('../repositories/projectRepository.js')).default;
const jwtConfig = (await import('../config/jwt.js')).default;
const mongoose = (await import('mongoose')).default;

describe('Materials Catalog & Ledger Endpoints API tests', () => {
  // Mock Users
  const adminUser = { _id: '60d0fe4f5311236168a109aa', name: 'Admin User', email: 'admin@test.com', role: 'admin', isActive: true };
  const pmUser = { _id: '60d0fe4f5311236168a109bb', name: 'Project Manager', email: 'pm@test.com', role: 'project_manager', isActive: true };
  const engineerUser = { _id: '60d0fe4f5311236168a109cc', name: 'Site Engineer', email: 'eng@test.com', role: 'site_engineer', isActive: true };

  // Tokens
  const adminToken = jwt.sign({ id: adminUser._id, role: adminUser.role, email: adminUser.email }, jwtConfig.accessSecret);
  const pmToken = jwt.sign({ id: pmUser._id, role: pmUser.role, email: pmUser.email }, jwtConfig.accessSecret);
  const engineerToken = jwt.sign({ id: engineerUser._id, role: engineerUser.role, email: engineerUser.email }, jwtConfig.accessSecret);

  // Mock Objects
  const projectId = '60d0fe4f5311236168a109ee';
  const mockMaterial = {
    _id: '60d0fe4f5311236168a109ff',
    name: 'Cement (OPC 53)',
    category: 'Binder',
    unit: 'bag',
    unitCost: 450,
    isDeleted: false
  };

  const mockInventory = {
    _id: '60d0fe4f5311236168a109a1',
    projectId,
    materialId: mockMaterial,
    quantityAvailable: 100,
    lowStockThreshold: 20
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default: users are member of Metropolis Tower project team
    projectTeamRepository.isUserOnProjectTeam.mockResolvedValue(true);
    auditLogService.logAction.mockResolvedValue({});
    
    // Mock mongoose startSession to avoid hanging in tests without a DB connection
    jest.spyOn(mongoose, 'startSession').mockResolvedValue({
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn()
    });

    // Mock userRepository findById to resolve mock profiles for JWT authentication
    userRepository.findById.mockImplementation(async (id) => {
      if (id === adminUser._id) return adminUser;
      if (id === pmUser._id) return pmUser;
      if (id === engineerUser._id) return engineerUser;
      return null;
    });

    // Mock projectRepository findById to resolve project context for RLAC middleware
    projectRepository.findById.mockResolvedValue({
      _id: projectId,
      name: 'Metropolis Tower',
      managerId: pmUser._id
    });
  });

  describe('Materials Catalog CRUD', () => {
    it('should allow Admin to create a new catalog material', async () => {
      materialRepository.findByName.mockResolvedValue(null);
      materialRepository.create.mockResolvedValue(mockMaterial);

      const res = await request(app)
        .post('/api/v1/materials')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Cement (OPC 53)',
          category: 'Binder',
          unit: 'bag',
          unitCost: 450
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(mockMaterial.name);
    });

    it('should block non-admin users from creating catalog materials', async () => {
      const res = await request(app)
        .post('/api/v1/materials')
        .set('Authorization', `Bearer ${engineerToken}`)
        .send({
          name: 'Cement (OPC 53)',
          category: 'Binder',
          unit: 'bag',
          unitCost: 450
        });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/v1/projects/:projectId/requests (Material Requests)', () => {
    it('should successfully submit request and flag duplicates if repeats exist', async () => {
      materialRepository.findById.mockResolvedValue(mockMaterial);
      
      // Simulate duplicate check matches another request in past 24 hours
      materialRequestRepository.findDuplicates.mockResolvedValue([
        { _id: 'duplicateRequest1', quantityRequested: 50 }
      ]);
      
      materialRequestRepository.create.mockResolvedValue({
        _id: 'newReq123',
        projectId,
        materialId: mockMaterial._id,
        requestedBy: engineerUser._id,
        quantityRequested: 50,
        aiDuplicateFlag: true,
        status: 'pending'
      });

      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/requests`)
        .set('Authorization', `Bearer ${engineerToken}`)
        .send({
          materialId: mockMaterial._id,
          quantityRequested: 50
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.aiDuplicateFlag).toBe(true); // AI check flagged duplicate
      expect(materialRequestRepository.create).toHaveBeenCalled();
    });
  });

  describe('PUT /api/v1/projects/:projectId/requests/:id/approve & Fulfill', () => {
    const mockRequest = {
      _id: 'req123',
      projectId,
      materialId: mockMaterial,
      requestedBy: engineerUser._id,
      quantityRequested: 50,
      status: 'pending',
      save: jest.fn().mockImplementation(function() { return this; })
    };

    it('should allow PM to approve pending requests', async () => {
      materialRequestRepository.findById.mockResolvedValue(mockRequest);

      const res = await request(app)
        .put(`/api/v1/projects/${projectId}/requests/${mockRequest._id}/approve`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({ status: 'approved' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('approved');
    });

    it('should successfully fulfill approved request, decrement stock, and trigger stock alerts', async () => {
      const approvedRequest = {
        ...mockRequest,
        status: 'approved',
        save: jest.fn().mockImplementation(function() { return this; })
      };
      materialRequestRepository.findById.mockResolvedValue(approvedRequest);
      
      // Stock before = 100, threshold = 20. Fulfilling req (50) drops it to 50 (above threshold).
      materialInventoryRepository.findByProjectAndMaterial.mockResolvedValue(mockInventory);
      materialTransactionRepository.create.mockResolvedValue({});
      
      // Fulfilling decrements 50 -> returns remaining 50
      materialInventoryRepository.updateStock.mockResolvedValue({
        ...mockInventory,
        quantityAvailable: 50
      });

      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/requests/${approvedRequest._id}/fulfill`)
        .set('Authorization', `Bearer ${pmToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('fulfilled');
      expect(materialInventoryRepository.updateStock).toHaveBeenCalled();
      expect(socketService.emitToProject).not.toHaveBeenCalled(); // above threshold, no emit
    });

    it('should fire low stock alarms and notifications if stock falls below threshold', async () => {
      const approvedRequest = {
        ...mockRequest,
        status: 'approved',
        save: jest.fn().mockImplementation(function() { return this; })
      };
      materialRequestRepository.findById.mockResolvedValue(approvedRequest);
      
      // Stock before = 100, fulfilling req (90) drops it to 10 (below threshold = 20)
      materialInventoryRepository.findByProjectAndMaterial.mockResolvedValue(mockInventory);
      materialTransactionRepository.create.mockResolvedValue({});
      
      // Returns 10 available
      materialInventoryRepository.updateStock.mockResolvedValue({
        ...mockInventory,
        quantityAvailable: 10
      });
      notificationRepository.create.mockResolvedValue({});

      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/requests/${approvedRequest._id}/fulfill`)
        .set('Authorization', `Bearer ${pmToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      
      // Asserts that low stock events are fired
      expect(socketService.emitToProject).toHaveBeenCalledWith(projectId, 'low_stock_alert', expect.any(Object));
      expect(notificationRepository.create).toHaveBeenCalled();
    });
  });
});
