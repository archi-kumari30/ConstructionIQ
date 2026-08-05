let mockReadyState = 1;

// Mock mongoose before app is imported
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  
  // Create a proxy over the native connection to dynamically override readyState
  const connectionProxy = new Proxy(actualMongoose.connection, {
    get(target, prop) {
      if (prop === 'readyState') {
        return mockReadyState;
      }
      return target[prop];
    }
  });

  return {
    ...actualMongoose,
    connection: connectionProxy
  };
});

const request = require('supertest');
const app = require('../app');

describe('GET /api/v1/health', () => {
  it('should return UP status when database is connected (readyState = 1)', async () => {
    mockReadyState = 1;

    const res = await request(app).get('/api/v1/health');
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('UP');
    expect(res.body.data.services.database).toBe('UP');
  });

  it('should return DOWN status when database is disconnected (readyState = 0)', async () => {
    mockReadyState = 0;

    const res = await request(app).get('/api/v1/health');
    
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.services.database).toBe('DOWN');
  });
});
