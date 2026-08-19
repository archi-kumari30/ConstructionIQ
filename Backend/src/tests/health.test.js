const request = (await import('supertest')).default;
const mongoose = (await import('mongoose')).default;
const app = (await import('../app.js')).default;

describe('GET /api/v1/health', () => {
  it('should return UP status when database is connected (readyState = 1)', async () => {
    mongoose.connection._readyState = 1;

    const res = await request(app).get('/api/v1/health');
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('UP');
    expect(res.body.data.services.database).toBe('UP');
  });

  it('should return DOWN status when database is disconnected (readyState = 0)', async () => {
    mongoose.connection._readyState = 0;

    const res = await request(app).get('/api/v1/health');
    
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.errors.services.database).toBe('DOWN');
  });
});
