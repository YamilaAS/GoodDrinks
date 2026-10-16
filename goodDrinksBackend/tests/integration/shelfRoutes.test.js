const request = require('supertest');
const app = require('../../src/index');
const mongoose = require('mongoose');
const User = require('../../src/models/user');
const Wine = require('../../src/models/wine');
const Shelf = require('../../src/models/shelf');

describe('🧪 Pruebas de Integración de Cavas/Estantes (Shelf Routes)', () => {
  let token = '';
  let testWineId = '';

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://mongo:27017/gooddrinks';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    const timestamp = Date.now();
    await request(app)
      .post('/api/users/register')
      .send({
        username: `shelftester${timestamp}`,
        email: `shelftester_${timestamp}@gooddrinks.com`,
        password: 'Password123!'
      });

    const loginRes = await request(app)
      .post('/api/users/login')
      .send({
        email: `shelftester_${timestamp}@gooddrinks.com`,
        password: 'Password123!'
      });

    token = loginRes.body.token;

    const wineRes = await request(app)
      .post('/api/wines')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Chardonnay Shelf Test',
        type: 'Blanco',
        winery: 'Bodega Cava',
        year: 2022,
        region: 'Mendoza',
        variety: 'Chardonnay',
        imageUrl: 'https://ejemplo.com/chardonnay.jpg'
      });

    testWineId = wineRes.body._id;
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /@gooddrinks\.com$/ } });
    await Wine.deleteMany({ name: 'Chardonnay Shelf Test' });
    await Shelf.deleteMany({ wine: testWineId });
    await mongoose.connection.close();
  });

  it('📦 Debería agregar un vino a la estantería "Por probar"', async () => {
    const response = await request(app)
      .post('/api/shelves')
      .set('Authorization', `Bearer ${token}`)
      .send({
        wineId: testWineId,
        status: 'Por probar'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.status).toBe('Por probar');
  });

  it('🔄 Debería actualizar el estado del vino a "Tomando" (Upsert)', async () => {
    const response = await request(app)
      .post('/api/shelves')
      .set('Authorization', `Bearer ${token}`)
      .send({
        wineId: testWineId,
        status: 'Tomando'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.status).toBe('Tomando');
  });

  it('📚 Debería obtener las estanterías agrupadas en GET /api/shelves/me', async () => {
    const response = await request(app)
      .get('/api/shelves/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('porProbar');
    expect(response.body).toHaveProperty('tomando');
    expect(response.body).toHaveProperty('yaTomados');
  });

  it('🗑️ Debería quitar el vino de la estantería', async () => {
    const response = await request(app)
      .delete(`/api/shelves/${testWineId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Vino removido de tus estanterías exitosamente');
  });
});