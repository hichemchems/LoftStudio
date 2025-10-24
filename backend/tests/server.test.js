const request = require('supertest');
const app = require('../app');

describe('Server', () => {
  it('should respond to GET /api/v1/health', async () => {
    const response = await request(app).get('/api/v1/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
  });

  it('should respond to GET /api/v1/csrf-token', async () => {
    const response = await request(app).get('/api/v1/csrf-token');
    // CSRF is disabled in test mode, so it returns a test token
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('csrfToken', 'disabled-for-production');
  });
});
