const request = require('supertest');
const app = require('../../src/index');
const mongoose = require('mongoose');
const User = require('../../src/models/user');

describe('🧪 Pruebas de Autenticación de Usuarios', () => {
  const timestamp = Date.now();
  // Alfanumérico puro sin guiones para cumplir con Joi .alphanum()
  const usernameTest = `user${timestamp}`; 
  const emailTest = `tester_${timestamp}@gooddrinks.com`;
  const passwordTest = 'Password123!';

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://mongo:27017/gooddrinks';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /@gooddrinks\.com$/ } });
    await mongoose.connection.close();
  });

  // --- 1. TEST DE REGISTRO ---
  it('🚀 Debería registrar un nuevo usuario con éxito', async () => {
    const respuesta = await request(app)
      .post('/api/users/register') 
      .send({
        username: usernameTest,
        email: emailTest,
        password: passwordTest
      });

    if (respuesta.statusCode !== 200 && respuesta.statusCode !== 201) {
      console.log('🔴 Error en validación/registro:', respuesta.body);
    }

    expect([200, 201]).toContain(respuesta.statusCode);
  });

  // --- 2. TEST DE LOGIN EXITOSO ---
  it('🔑 Debería iniciar sesión con éxito y devolver un JWT', async () => {
    const respuesta = await request(app)
      .post('/api/users/login') 
      .send({
        email: emailTest,
        password: passwordTest
      });

    expect(respuesta.statusCode).toBe(200);
    expect(respuesta.body).toHaveProperty('token');
  });
});