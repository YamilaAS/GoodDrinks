const request = require('supertest');
const app = require('../../src/index');
const mongoose = require('mongoose');
const User = require('../../src/models/user');
const Wine = require('../../src/models/wine');
const Rating = require('../../src/models/rating');

describe('🧪 Pruebas de Integración de Calificaciones (Rating Routes)', () => {
  let token = '';
  let testWineId = '';
  let createdRatingId = '';

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://mongo:27017/gooddrinks';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    const timestamp = Date.now();
    await request(app)
      .post('/api/users/register')
      .send({
        username: `ratingtester${timestamp}`,
        email: `ratingtester_${timestamp}@gooddrinks.com`,
        password: 'Password123!'
      });

    const loginRes = await request(app)
      .post('/api/users/login')
      .send({
        email: `ratingtester_${timestamp}@gooddrinks.com`,
        password: 'Password123!'
      });

    token = loginRes.body.token;

    // Crear vino para calificar
    const wineRes = await request(app)
      .post('/api/wines')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cabernet Rating Test',
        type: 'Tinto',
        winery: 'Bodega Test',
        year: 2020,
        region: 'Mendoza',
        variety: 'Cabernet',
        imageUrl: 'https://ejemplo.com/vino.jpg'
      });

    testWineId = wineRes.body._id;
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /@gooddrinks\.com$/ } });
    await Wine.deleteMany({ name: 'Cabernet Rating Test' });
    await Rating.deleteMany({ wine: testWineId });
    await mongoose.connection.close();
  });

  it('⭐ Debería crear una calificación para un vino', async () => {
    const response = await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        wineId: testWineId,
        rating: 5,
        comments: 'Excelente vino!'
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.rating).toBe(5);
    createdRatingId = response.body._id;
  });

  it('🚫 Debería rechazar calificación duplicada del mismo usuario', async () => {
    const response = await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        wineId: testWineId,
        rating: 4,
        comments: 'Intento duplicado'
      });

    expect(response.statusCode).toBe(400);
  });

  it('🍷 Debería actualizar el averageRating en el modelo Wine', async () => {
    const wine = await Wine.findById(testWineId);
    expect(wine.averageRating).toBe(5);
  });

  it('👍 Debería hacer toggle de like a la reseña', async () => {
    const response = await request(app)
      .post(`/api/ratings/${createdRatingId}/like`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Reseña cliqueada con Like con éxito');
  });
});