const request = require('supertest');
const app = require('../app');
const deliveryRepository = require('../repositories/deliveryRepository');
const budgetRepository = require('../repositories/budgetRepository');
const expenseRepository = require('../repositories/expenseRepository');
const materialRepository = require('../repositories/materialRepository');
const materialInventoryRepository = require('../repositories/materialInventoryRepository');
const materialTransactionRepository = require('../repositories/materialTransactionRepository');
const projectRepository = require('../repositories/projectRepository');
const projectTeamRepository = require('../repositories/projectTeamRepository');
const userRepository = require('../repositories/userRepository');
const auditLogService = require('../services/auditLogService');
const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');
const mongoose = require('mongoose');

// Mock dependencies
jest.mock('../repositories/deliveryRepository');
jest.mock('../repositories/budgetRepository');
jest.mock('../repositories/expenseRepository');
jest.mock('../repositories/materialRepository');
jest.mock('../repositories/materialInventoryRepository');
jest.mock('../repositories/materialTransactionRepository');
jest.mock('../repositories/projectRepository');
jest.mock('../repositories/projectTeamRepository');
jest.mock('../repositories/userRepository');
jest.mock('../services/auditLogService');

describe('Logistics, Budgeting & Expenses Endpoints API tests', () => {
  // Mock User Profiles
  const adminUser = { _id: '60d0fe4f5311236168a109aa', name: 'Admin User', email: 'admin@test.com', role: 'admin', isActive: true };
  const pmUser = { _id: '60d0fe4f5311236168a109bb', name: 'Project Manager', email: 'pm@test.com', role: 'project_manager', isActive: true };
  const supplierUser = { _id: '60d0fe4f5311236168a109cc', name: 'Supplier Corp', email: 'supplier@test.com', role: 'supplier', isActive: true };
  const engineerUser = { _id: '60d0fe4f5311236168a109dd', name: 'Site Engineer', email: 'eng@test.com', role: 'site_engineer', isActive: true };

  // Tokens
  const adminToken = jwt.sign({ id: adminUser._id, role: adminUser.role, email: adminUser.email }, jwtConfig.accessSecret);
  const pmToken = jwt.sign({ id: pmUser._id, role: pmUser.role, email: pmUser.email }, jwtConfig.accessSecret);
  const supplierToken = jwt.sign({ id: supplierUser._id, role: supplierUser.role, email: supplierUser.email }, jwtConfig.accessSecret);
  const engineerToken = jwt.sign({ id: engineerUser._id, role: engineerUser.role, email: engineerUser.email }, jwtConfig.accessSecret);

  // Mock Objects
  const projectId = '60d0fe4f5311236168a109ee';
  const mockMaterial = { _id: '60d0fe4f5311236168a109a1', name: 'Cement (OPC 53)', category: 'cement', unit: 'bags' };
  
  const mockDelivery = {
    _id: '60d0fe4f5311236168a109d1',
    projectId,
    materialId: mockMaterial._id,
    quantityOrdered: 100,
    quantityReceived: 0,
    supplierId: supplierUser._id,
    status: 'ordered',
    save: jest.fn().mockImplementation(function() { return this; })
  };

  const mockBudget = {
    _id: '60d0fe4f5311236168a109b1',
    projectId,
    category: 'materials',
    allocatedAmount: 50000,
    spentAmount: 10000,
    save: jest.fn().mockImplementation(function() { return this; })
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default JWT auth resolves active user
    userRepository.findById.mockImplementation(async (id) => {
      if (id === adminUser._id) return adminUser;
      if (id === pmUser._id) return pmUser;
      if (id === supplierUser._id) return supplierUser;
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

  describe('Logistics (Deliveries)', () => {
    it('should allow Supplier to submit delivery shipments', async () => {
      materialRepository.findById.mockResolvedValue(mockMaterial);
      deliveryRepository.create.mockResolvedValue(mockDelivery);

      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/deliveries`)
        .set('Authorization', `Bearer ${supplierToken}`)
        .send({
          materialId: mockMaterial._id,
          quantityOrdered: 100,
          supplierId: supplierUser._id
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ordered');
    });

    it('should trigger stock increments when delivery status changes to delivered', async () => {
      deliveryRepository.findByIdRaw.mockResolvedValue(mockDelivery);
      
      const deliveredShipment = {
        ...mockDelivery,
        status: 'delivered',
        quantityReceived: 100
      };

      // Mock update to return delivered object
      jest.spyOn(Delivery, 'findByIdAndUpdate').mockResolvedValue(deliveredShipment);

      const res = await request(app)
        .put(`/api/v1/projects/${projectId}/deliveries/${mockDelivery._id}`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({
          status: 'delivered',
          quantityReceived: 100
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('delivered');
      
      // Stock increment updates called
      expect(materialInventoryRepository.updateStock).toHaveBeenCalledWith(projectId, mockDelivery.materialId, 100, expect.anything());
      expect(materialTransactionRepository.create).toHaveBeenCalled();
    });
  });

  describe('Budget Allocation', () => {
    it('should allow PM to allocate category budgets', async () => {
      budgetRepository.upsertBudget.mockResolvedValue(mockBudget);

      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/budgets`)
        .set('Authorization', `Bearer ${pmToken}`)
        .send({
          category: 'materials',
          allocatedAmount: 50000
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.allocatedAmount).toBe(50000);
    });
  });

  describe('Expense Logging & Controls', () => {
    it('should successfully log expense within budget limit', async () => {
      budgetRepository.findByCategoryRaw.mockResolvedValue(mockBudget); // Allocated: 50000, Spent: 10000
      expenseRepository.findRecentExpenses.mockResolvedValue([]); // No recent expenses to trigger stats
      
      const loggedExpense = {
        _id: 'exp123',
        projectId,
        category: 'materials',
        amount: 5000,
        date: new Date('2026-09-01'),
        loggedBy: engineerUser._id,
        aiAnomalyFlag: false
      };
      expenseRepository.create.mockResolvedValue(loggedExpense);

      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/expenses`)
        .set('Authorization', `Bearer ${engineerToken}`)
        .send({
          category: 'materials',
          amount: 5000,
          date: '2026-09-01'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.amount).toBe(5000);
      expect(budgetRepository.updateSpentAmount).toHaveBeenCalledWith(projectId, 'materials', 5000, expect.anything());
    });

    it('should block expense when amount exceeds category remaining budget', async () => {
      budgetRepository.findByCategoryRaw.mockResolvedValue(mockBudget); // Allocated: 50000, Spent: 10000

      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/expenses`)
        .set('Authorization', `Bearer ${engineerToken}`)
        .send({
          category: 'materials',
          amount: 45000, // 45000 + 10000 spent = 55000 > 50000 allocated
          date: '2026-09-01'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('exceeds allocated budget');
    });

    it('should trigger AI anomaly audit flag when expense is statistically anomalous', async () => {
      budgetRepository.findByCategoryRaw.mockResolvedValue(mockBudget); // Allocated: 50000, Spent: 10000

      // Seed 5 matching historical expenses averaging around $1000
      const recentExpenses = [
        { amount: 1000 },
        { amount: 950 },
        { amount: 1050 },
        { amount: 900 },
        { amount: 1100 }
      ];
      expenseRepository.findRecentExpenses.mockResolvedValue(recentExpenses);

      expenseRepository.create.mockImplementation(async (data) => {
        return {
          ...data,
          _id: 'expAnomalous123'
        };
      });

      const res = await request(app)
        .post(`/api/v1/projects/${projectId}/expenses`)
        .set('Authorization', `Bearer ${engineerToken}`)
        .send({
          category: 'materials',
          amount: 3000, // > 150% of the mean ($1000)
          date: '2026-09-01'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.aiAnomalyFlag).toBe(true);
      expect(res.body.data.aiAnomalyDetails).toContain('statistically anomalous');
    });
  });
});

// Import model helper at bottom to prevent mock conflicts
const Delivery = require('../models/Delivery');
