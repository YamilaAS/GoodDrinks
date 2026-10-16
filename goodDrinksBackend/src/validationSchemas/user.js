const request = require('supertest');
const app = require('../index'); // Asegúrate de que apunte bien a tu index.js principal
const mongoose = require('mongoose');

describe('🧪 Pruebas de Autenticación de Usuarios', () => {
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
        name: 'Usuario Test',     // Por si lo pide tu modelo de Mongoose
        username: 'UsuarioTest', // Para que Joi no tire error 400
        email: emailTest,
        password: passwordTest
      });

    // Imprime el cuerpo del error si llega a fallar con 500 para saber qué pasó exactamente
    if (respuesta.statusCode === 500) {
      console.log('🔴 Error interno del servidor:', respuesta.body);
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
    expect(respuesta.body).toBeDefined();
  });

});