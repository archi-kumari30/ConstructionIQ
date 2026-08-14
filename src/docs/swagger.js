import ROLES from '../constants/roles.js';
import STATUS from '../constants/status.js';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'ConstructionIQ REST API Documentation',
    version: '1.0.0',
    description: 'Enterprise Backend API for ConstructionIQ Construction Management Platform.'
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API version 1 root'
    }
  ],
  paths: {
    '/health': {
      get: {
        summary: 'Check service health status',
        responses: {
          200: {
            description: 'Application is operational'
          }
        }
      }
    },
    '/auth/register': {
      post: {
        summary: 'Register a new user account',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } }
        },
        responses: { 201: { description: 'User registered' } }
      }
    },
    '/auth/login': {
      post: {
        summary: 'Authenticate user & issue tokens',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } }
        },
        responses: { 200: { description: 'Authenticated successfully' } }
      }
    },
    '/auth/refresh-token': {
      post: {
        summary: 'Refresh access JWT token',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshTokenRequest' } } }
        },
        responses: { 200: { description: 'Token refreshed' } }
      }
    },
    '/projects': {
      post: {
        summary: 'Create a new project workspace',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateProjectRequest' } } }
        },
        responses: { 201: { description: 'Project created' } }
      },
      get: {
        summary: 'List project workspaces',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Projects fetched' } }
      }
    },
    '/projects/{id}': {
      get: {
        summary: 'Get project workspace details',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Project retrieved' } }
      },
      put: {
        summary: 'Update project workspace details',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateProjectRequest' } } }
        },
        responses: { 200: { description: 'Project updated' } }
      },
      delete: {
        summary: 'Soft-delete project workspace',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Project soft-deleted' } }
      }
    },
    '/projects/{projectId}/team': {
      get: {
        summary: 'List project team members',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Team list fetched' } }
      },
      post: {
        summary: 'Add member to project team',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/AddTeamMemberRequest' } } }
        },
        responses: { 201: { description: 'Member added' } }
      }
    },
    '/projects/{projectId}/team/{userId}': {
      delete: {
        summary: 'Remove member from project team',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'userId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Member removed' } }
      }
    },
    '/projects/{projectId}/milestones': {
      get: {
        summary: 'List project milestones',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Milestones fetched' } }
      },
      post: {
        summary: 'Create project milestone',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateMilestoneRequest' } } }
        },
        responses: { 201: { description: 'Milestone created' } }
      }
    },
    '/projects/{projectId}/milestones/{id}': {
      put: {
        summary: 'Update milestone details',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateMilestoneRequest' } } }
        },
        responses: { 200: { description: 'Milestone updated' } }
      },
      delete: {
        summary: 'Delete milestone',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Milestone deleted' } }
      }
    },
    '/materials': {
      get: {
        summary: 'List global materials catalog',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Materials catalog fetched' } }
      },
      post: {
        summary: 'Add material to catalog',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateMaterialRequest' } } }
        },
        responses: { 201: { description: 'Material added' } }
      }
    },
    '/materials/{id}': {
      put: {
        summary: 'Update catalog material details',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateMaterialRequest' } } }
        },
        responses: { 200: { description: 'Material updated' } }
      },
      delete: {
        summary: 'Delete material from catalog',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Material soft-deleted' } }
      }
    },
    '/projects/{projectId}/inventory': {
      get: {
        summary: 'List project stock inventory levels',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Project stock levels fetched' } }
      }
    },
    '/projects/{projectId}/inventory/{materialId}/threshold': {
      put: {
        summary: 'Configure inventory stock alarm thresholds',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'materialId', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ConfigureThresholdRequest' } } }
        },
        responses: { 200: { description: 'Threshold updated' } }
      }
    },
    '/projects/{projectId}/transactions': {
      get: {
        summary: 'View material transactions ledger',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Stock transaction logs fetched' } }
      },
      post: {
        summary: 'Log manual stock movements (Double-entry ledger)',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LogTransactionRequest' } } }
        },
        responses: { 201: { description: 'Stock ledger updated' } }
      }
    },
    '/projects/{projectId}/requests': {
      get: {
        summary: 'List project material requests',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Requests list fetched' } }
      },
      post: {
        summary: 'Submit a new material request',
        description: 'Site engineer requests materials. AI Duplicate detector will audit matches.',
        security: [{ BearerAuth: [] }],
        parameters: [{ name: 'projectId', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateRequestSchema' } } }
        },
        responses: { 201: { description: 'Request submitted' } }
      }
    },
    '/projects/{projectId}/requests/{id}/approve': {
      put: {
        summary: 'Approve or Reject material request',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/ApproveRequestRequest' } } }
        },
        responses: { 200: { description: 'Request updated' } }
      }
    },
    '/projects/{projectId}/requests/{id}/fulfill': {
      post: {
        summary: 'Fulfill material request (Atomic Transaction)',
        description: 'Fulfills an approved material request: decrements stock levels atomically, emits socket low-stock alerts, logs ledger.',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'projectId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Request fulfilled, inventory updated' } }
      }
    }
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      StandardResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object', nullable: true },
          errors: { type: 'array', items: { type: 'object' }, nullable: true }
        }
      },
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 2 },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 6 },
          role: { type: 'string', enum: Object.values(ROLES) },
          phone: { type: 'string' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' }
        }
      },
      RefreshTokenRequest: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' }
        }
      },
      CreateProjectRequest: {
        type: 'object',
        required: ['name', 'location', 'startDate', 'endDate', 'budgetEstimated', 'managerId'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          location: { type: 'string' },
          coordinates: {
            type: 'object',
            properties: {
              latitude: { type: 'number' },
              longitude: { type: 'number' }
            }
          },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          status: { type: 'string', enum: Object.values(STATUS.PROJECT) },
          budgetEstimated: { type: 'number' },
          managerId: { type: 'string' }
        }
      },
      UpdateProjectRequest: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          location: { type: 'string' },
          coordinates: {
            type: 'object',
            properties: {
              latitude: { type: 'number' },
              longitude: { type: 'number' }
            }
          },
          startDate: { type: 'string', format: 'date' },
          endDate: { type: 'string', format: 'date' },
          status: { type: 'string', enum: Object.values(STATUS.PROJECT) },
          budgetEstimated: { type: 'number' },
          managerId: { type: 'string' }
        }
      },
      AddTeamMemberRequest: {
        type: 'object',
        required: ['userId', 'roleOnProject'],
        properties: {
          userId: { type: 'string' },
          roleOnProject: { type: 'string' }
        }
      },
      CreateMilestoneRequest: {
        type: 'object',
        required: ['title', 'targetDate'],
        properties: {
          title: { type: 'string' },
          targetDate: { type: 'string', format: 'date' },
          status: { type: 'string', enum: Object.values(STATUS.MILESTONE) }
        }
      },
      UpdateMilestoneRequest: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          targetDate: { type: 'string', format: 'date' },
          completedDate: { type: 'string', format: 'date' },
          status: { type: 'string', enum: Object.values(STATUS.MILESTONE) }
        }
      },
      CreateMaterialRequest: {
        type: 'object',
        required: ['name', 'category', 'unit', 'unitCost'],
        properties: {
          name: { type: 'string' },
          category: { type: 'string' },
          unit: { type: 'string' },
          unitCost: { type: 'number' }
        }
      },
      UpdateMaterialRequest: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          category: { type: 'string' },
          unit: { type: 'string' },
          unitCost: { type: 'number' }
        }
      },
      ConfigureThresholdRequest: {
        type: 'object',
        required: ['lowStockThreshold'],
        properties: {
          lowStockThreshold: { type: 'number' },
          warehouseLocation: { type: 'string' }
        }
      },
      LogTransactionRequest: {
        type: 'object',
        required: ['materialId', 'type', 'quantity'],
        properties: {
          materialId: { type: 'string' },
          type: { type: 'string', enum: Object.values(STATUS.MATERIAL_TRANSACTION) },
          quantity: { type: 'number' },
          referenceId: { type: 'string' }
        }
      },
      CreateRequestSchema: {
        type: 'object',
        required: ['materialId', 'quantityRequested'],
        properties: {
          materialId: { type: 'string' },
          quantityRequested: { type: 'number' }
        }
      },
      ApproveRequestRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['approved', 'rejected'] }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  role: { type: 'string' }
                }
              },
              tokens: {
                type: 'object',
                properties: {
                  accessToken: { type: 'string' },
                  refreshToken: { type: 'string' }
                }
              }
            }
          }
        }
      }
    }
  }
};

export default swaggerDocument;
