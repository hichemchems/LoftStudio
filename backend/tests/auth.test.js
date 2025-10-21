const request = require('supertest');
const { app, server } = require('../server');

describe('Auth Routes', () => {
  afterAll((done) => {
    server.close(done);
  });

  it('should return 401 for GET /auth/me without token', async () => {
    const response = await request(app).get('/api/v1/auth/me');
    expect(response.status).toBe(401);
  });

  it('should return 400 for POST /auth/login with invalid data', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: '', password: '' });
    expect(response.status).toBe(400);
  });

  it('should return 400 for POST /auth/register with invalid data', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: '', password: '' });
    expect(response.status).toBe(400);
  });
});
