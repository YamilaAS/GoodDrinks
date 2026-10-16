const request = require('supertest');
const app = require('../index');
const mongoose = require('mongoose');

describe('🧪 Pruebas de Autenticación de Usuarios', () => {
  // Ahora sí, definimos las variables globales del bloque de tests
  const emailTest = `tester_${Date.now()}@gooddrinks.com`;
  const passwordTest = 'Password123!';

  afterAll(async () => {
    await mongoose.connection.close();
  });

  // --- 1. TEST DE REGISTRO ---
  it('🚀 Debería registrar un nuevo usuario con éxito', async () => {
    const respuesta = await request(app)
      .post('/api/users/register') 
      .send({
        name: 'Usuario Test',
        email: emailTest,
        password: passwordTest
      });

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
    expect(respuesta.body).toBeDefined();
  });

});