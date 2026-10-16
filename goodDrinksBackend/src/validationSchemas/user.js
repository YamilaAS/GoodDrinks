const Joi = require('joi');

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    'string.empty': 'El nombre de usuario es obligatorio',
    'string.min': 'El nombre de usuario debe tener al menos 3 caracteres'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Debe ingresar un correo electrónico válido',
    'string.empty': 'El correo electrónico es obligatorio'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'La contraseña debe tener al menos 6 caracteres',
    'string.empty': 'La contraseña es obligatoria'
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Debe ingresar un correo electrónico válido',
    'string.empty': 'El correo electrónico es obligatorio'
  }),
  password: Joi.string().required().messages({
    'string.empty': 'La contraseña es obligatoria'
  })
});

const updateUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  updateUserSchema
};