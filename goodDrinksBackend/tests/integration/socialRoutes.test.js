const request = require('supertest');
const app = require('../../src/index');
const mongoose = require('mongoose');
const User = require('../../src/models/user');
const Wine = require('../../src/models/wine');
const Rating = require('../../src/models/rating');

describe('🧪 Pruebas de Integración Social (Social Routes)', () => {
  let user1Token = '';
  let user1Id = '';
  let user2Token = '';
  let user2Id = '';
  let testWineId = null;

  beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://mongo:27017/gooddrinks';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri);
    }

    const timestamp = Date.now();

    // 1. Registrar y loguear Usuario 1
    await request(app)
      .post('/api/users/register')
      .send({
        username: `sommelier${timestamp}`,
        email: `sommelier_${timestamp}@gooddrinks.com`,
        password: 'Password123!'
      });

    const u1Login = await request(app)
      .post('/api/users/login')
      .send({
        email: `sommelier_${timestamp}@gooddrinks.com`,
        password: 'Password123!'
      });

    user1Token = u1Login.body.token;
    const user1Doc = await User.findOne({ email: `sommelier_${timestamp}@gooddrinks.com` });
    user1Id = user1Doc._id.toString();

    // 2. Registrar y loguear Usuario 2
    await request(app)
      .post('/api/users/register')
      .send({
        username: `follower${timestamp}`,
        email: `follower_${timestamp}@gooddrinks.com`,
        password: 'Password123!'
      });

    const u2Login = await request(app)
      .post('/api/users/login')
      .send({
        email: `follower_${timestamp}@gooddrinks.com`,
        password: 'Password123!'
      });

    user2Token = u2Login.body.token;
    const user2Doc = await User.findOne({ email: `follower_${timestamp}@gooddrinks.com` });
    user2Id = user2Doc._id.toString();

    // 3. Usuario 1 crea un vino y una reseña
    const wineRes = await request(app)
      .post('/api/wines')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        name: 'Gran Syrah Social',
        type: 'Tinto',
        winery: 'Bodega Social',
        year: 2020,
        region: 'San Juan',
        variety: 'Syrah',
        imageUrl: 'https://ejemplo.com/syrah.jpg'
      });

    testWineId = wineRes.body._id;

    await request(app)
      .post('/api/ratings')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        wineId: testWineId,
        rating: 5,
        comments: '¡Maravilloso Syrah!'
      });
  });

  afterAll(async () => {
    await User.deleteMany({ email: { $regex: /@gooddrinks\.com$/ } });
    await Wine.deleteMany({ name: 'Gran Syrah Social' });
    if (testWineId) {
      await Rating.deleteMany({ wine: testWineId });
    }
    await mongoose.connection.close();
  });

  it('🚫 No debería permitir que un usuario se siga a sí mismo', async () => {
    const response = await request(app)
      .post(`/api/social/follow/${user1Id}`) // User 1 intenta seguirse a sí mismo
      .set('Authorization', `Bearer ${user1Token}`);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('No puedes seguirte a ti mismo');
  });

  it('👥 Usuario 2 debería poder seguir a Usuario 1', async () => {
    const response = await request(app)
      .post(`/api/social/follow/${user1Id}`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Usuario seguido con éxito');
  });

  it('📰 Usuario 2 debería ver las reseñas de Usuario 1 en su feed', async () => {
    const response = await request(app)
      .get('/api/social/feed')
      .set('Authorization', `Bearer ${user2Token}`);

    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].wine.name).toBe('Gran Syrah Social');
  });

  it('🚶‍♂️ Usuario 2 debería poder dejar de seguir a Usuario 1', async () => {
    const response = await request(app)
      .post(`/api/social/unfollow/${user1Id}`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe('Has dejado de seguir al usuario');
  });
});