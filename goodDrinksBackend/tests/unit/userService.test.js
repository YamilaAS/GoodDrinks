const userService = require('../../src/services/userService');
const userRepository = require('../../src/repositories/userRepository');

jest.mock('../../src/repositories/userRepository');

describe('UserService - Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('debe registrar un usuario exitosamente si el email no existe', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue({
        _id: '123',
        username: 'testuser',
        email: 'test@example.com',
        toObject: () => ({ _id: '123', username: 'testuser', email: 'test@example.com', password: 'hashed' })
      });

      const result = await userService.registerUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      expect(result).not.toHaveProperty('password');
      expect(result.email).toBe('test@example.com');
      expect(userRepository.create).toHaveBeenCalledTimes(1);
    });

    it('debe lanzar error 400 si el email ya está registrado', async () => {
      userRepository.findByEmail.mockResolvedValue({ _id: '123', email: 'test@example.com' });

      await expect(
        userService.registerUser({ username: 'test', email: 'test@example.com', password: '123' })
      ).rejects.toThrow('El correo electrónico ya está registrado');
    });
  });
});