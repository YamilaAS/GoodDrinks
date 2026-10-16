const request = require('supertest');
const app = require('../../src/index');
const mongoose = require('mongoose');
const User = require('../../src/models/user');
const Wine = require('../../src/models/wine');

describe('🧪 Pruebas de Integración de Vinos (Wine Routes)', () => {
  let token = '';
  let createdWineId = '';

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://mongo:27017/gooddrinks';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    // Registramos y logueamos un usuario temporal para obtener un JWT válido
    const timestamp = Date.now();
    const userRes = await request(app)
      .post('/api/users/register')
      .send({
        username: `winetester${timestamp}`,
        email: `winetester_${timestamp}@gooddrinks.com`,
        password: 'Password123!'
      });

    const loginRes = await request(app)
      .post('/api/users/login')
      .send({
        email: `winetester_${timestamp}@gooddrinks.com`,
        password: 'Password123!'
      });

    token = loginRes.body.token;
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /@gooddrinks\.com$/ } });
    await Wine.deleteMany({ name: 'Malbec Reserva Test' });
    await mongoose.connection.close();
  });

  it('🚀 Debería rechazar la creación de un vino sin Token (401)', async () => {
    const response = await request(app)
      .post('/api/wines')
      .send({ name: 'Malbec sin token' });

    expect(response.statusCode).toBe(401);
  });

  it('🍷 Debería crear un vino con éxito enviando un Token válido', async () => {
    const response = await request(app)
      .post('/api/wines')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Malbec Reserva Test',
        type: 'Tinto',
        winery: 'Bodega Catena',
        year: 2021,
        region: 'Mendoza',
        variety: 'Malbec',
        imageUrl: 'https://ejemplo.com/malbec.jpg'
      });

    // Imprime el error exacto devuelto por Express si no es 201
    if (response.statusCode !== 201) {
      console.log('🔴 ERROR CREANDO VINO (500):', response.body);
    }

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.averageRating).toBe(0);
    createdWineId = response.body._id;
  });

  it('🔍 Debería obtener la lista de vinos', async () => {
    const response = await request(app).get('/api/wines');
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  it('🔎 Debería obtener un vino por su ID', async () => {
    const response = await request(app).get(`/api/wines/${createdWineId}`);
    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe('Malbec Reserva Test');
  });
});