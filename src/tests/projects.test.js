import { jest } from '@jest/globals';

const createMockModule = () => new Proxy({}, {
  get(target, key) {
    if (!(key in target)) target[key] = jest.fn();
    return target[key];
  }
});


// Mock dependencies
jest.unstable_mockModule('../repositories/projectRepository.js', () => ({ default: createMockModule() }));
jest.unstable_mockModule('../repositories/projectTeamRepository.js', () => ({ default: createMockModule() }));
jest.unstable_mockModule('../repositories/projectMilestoneRepository.js', () => ({ default: createMockModule() }));
jest.unstable_mockModule('../repositories/userRepository.js', () => ({ default: createMockModule() }));
jest.unstable_mockModule('../services/auditLogService.js', () => ({ default: createMockModule() }));

const request = (await import('supertest')).default;
const app = (await import('../app.js')).default;
const projectRepository = (await import('../repositories/projectRepository.js')).default;
const projectTeamRepository = (await import('../repositories/projectTeamRepository.js')).default;
const projectMilestoneRepository = (await import('../repositories/projectMilestoneRepository.js')).default;
const userRepository = (await import('../repositories/userRepository.js')).default;
const auditLogService = (await import('../services/auditLogService.js')).default;
const jwt = (await import('jsonwebtoken')).default;
const jwtConfig = (await import('../config/jwt.js')).default;

describe('Project Workspace Management Endpoints API tests', () => {
  // Mock User Profiles
  const adminUser = { _id: '60d0fe4f5311236168a109aa', name: 'Admin User', email: 'admin@test.com', role: 'admin', isActive: true };
  const managerUser = { _id: '60d0fe4f5311236168a109bb', name: 'Project Manager', email: 'pm@test.com', role: 'project_manager', isActive: true };
  const assignedEngineer = { _id: '60d0fe4f5311236168a109cc', name: 'Engineer Assigned', email: 'eng1@test.com', role: 'site_engineer', isActive: true };
  const unassignedEngineer = { _id: '60d0fe4f5311236168a109dd', name: 'Engineer Unassigned', email: 'eng2@test.com', role: 'site_engineer', isActive: true };

  // Tokens
  const adminToken = jwt.sign({ id: adminUser._id, role: adminUser.role, email: adminUser.email }, jwtConfig.accessSecret);
  const managerToken = jwt.sign({ id: managerUser._id, role: managerUser.role, email: managerUser.email }, jwtConfig.accessSecret);
  const assignedToken = jwt.sign({ id: assignedEngineer._id, role: assignedEngineer.role, email: assignedEngineer.email }, jwtConfig.accessSecret);
  const unassignedToken = jwt.sign({ id: unassignedEngineer._id, role: unassignedEngineer.role, email: unassignedEngineer.email }, jwtConfig.accessSecret);

  // Mock Project Data
  const mockProject = {
    _id: '60d0fe4f5311236168a109ee',
    name: 'Metropolis Tower',
    location: 'Downtown Core',
    startDate: new Date('2026-09-01'),
    endDate: new Date('2027-12-31'),
    status: 'planning',
    budgetEstimated: 15000000,
    managerId: managerUser._id,
    isDeleted: false
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default userRepository fetches to resolve active profiles
    userRepository.findById.mockImplementation(async (id) => {
      if (id === adminUser._id) return adminUser;
      if (id === managerUser._id) return managerUser;
      if (id === assignedEngineer._id) return assignedEngineer;
      if (id === unassignedEngineer._id) return unassignedEngineer;
      return null;
    });
  });

  describe('POST /api/v1/projects', () => {
    const payload = {
      name: 'Metropolis Tower',
      location: 'Downtown Core',
      startDate: '2026-09-01',
      endDate: '2027-12-31',
      budgetEstimated: 15000000,
      managerId: managerUser._id
    };

    it('should successfully create project when logged in as Admin', async () => {
      projectRepository.create.mockResolvedValue(mockProject);
      projectTeamRepository.addMember.mockResolvedValue({});
      auditLogService.logAction.mockResolvedValue({});

      const res = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(payload.name);
      expect(projectRepository.create).toHaveBeenCalled();
    });

    it('should block project creation when user is Site Engineer', async () => {
      const res = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${assignedToken}`)
        .send(payload);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Access Denied');
    });
  });

  describe('GET /api/v1/projects/:id (RLAC validation)', () => {
    it('should permit access to assigned Site Engineer', async () => {
      projectRepository.findById.mockResolvedValue(mockProject);
      projectTeamRepository.isUserOnProjectTeam.mockResolvedValue(true);

      const res = await request(app)
        .get(`/api/v1/projects/${mockProject._id}`)
        .set('Authorization', `Bearer ${assignedToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(mockProject.name);
    });

    it('should forbid access to unassigned Site Engineer', async () => {
      projectRepository.findById.mockResolvedValue(mockProject);
      projectTeamRepository.isUserOnProjectTeam.mockResolvedValue(false);

      const res = await request(app)
        .get(`/api/v1/projects/${mockProject._id}`)
        .set('Authorization', `Bearer ${unassignedToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('workspace team');
    });
  });

  describe('Workspace Team Allocation', () => {
    it('should allow PM to allocate team members', async () => {
      projectRepository.findById.mockResolvedValue(mockProject);
      // PM is the owner of Metropolis Tower
      projectTeamRepository.isUserOnProjectTeam.mockResolvedValue(false); // not member yet
      projectTeamRepository.addMember.mockResolvedValue({
        projectId: mockProject._id,
        userId: assignedEngineer._id,
        roleOnProject: 'Senior Superintendent',
        createdAt: new Date()
      });
      projectTeamRepository.findMember.mockResolvedValue({
        projectId: mockProject._id,
        userId: assignedEngineer,
        roleOnProject: 'Senior Superintendent',
        createdAt: new Date()
      });

      const res = await request(app)
        .post(`/api/v1/projects/${mockProject._id}/team`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          userId: assignedEngineer._id,
          roleOnProject: 'Senior Superintendent'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.roleOnProject).toBe('Senior Superintendent');
    });
  });

  describe('Milestone Timeline CRUD', () => {
    const mockMilestone = {
      _id: '60d0fe4f5311236168a109ff',
      projectId: mockProject._id,
      title: 'Foundation Completion',
      targetDate: new Date('2026-12-01'),
      status: 'pending'
    };

    it('should allow PM to add milestone to project', async () => {
      projectRepository.findById.mockResolvedValue(mockProject);
      projectMilestoneRepository.create.mockResolvedValue(mockMilestone);

      const res = await request(app)
        .post(`/api/v1/projects/${mockProject._id}/milestones`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          title: 'Foundation Completion',
          targetDate: '2026-12-01'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe(mockMilestone.title);
    });

    it('should prevent unassigned site engineers from adding milestones', async () => {
      projectRepository.findById.mockResolvedValue(mockProject);
      projectTeamRepository.isUserOnProjectTeam.mockResolvedValue(false);

      const res = await request(app)
        .post(`/api/v1/projects/${mockProject._id}/milestones`)
        .set('Authorization', `Bearer ${unassignedToken}`)
        .send({
          title: 'Foundation Completion',
          targetDate: '2026-12-01'
        });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/v1/projects (List & Search)', () => {
    it('should apply project manager filters when search query is active', async () => {
      projectTeamRepository.findByUser.mockResolvedValue([]);
      projectRepository.findAll.mockImplementation(async ({ filter, search }) => {
        expect(filter.$or).toBeDefined();
        expect(filter.$or).toContainEqual({ managerId: managerUser._id });
        expect(search).toBe('tower');
        return { data: [mockProject], total: 1, page: 1, limit: 10, totalPages: 1 };
      });

      const res = await request(app)
        .get('/api/v1/projects?search=tower')
        .set('Authorization', `Bearer ${managerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.projects.length).toBe(1);
    });
  });
});
