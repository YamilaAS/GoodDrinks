// src/validationSchemas/wine.js
const Joi = require('joi');

const createWineSchema = Joi.object({
  name: Joi.string().trim().required().messages({
    'string.empty': 'El nombre del vino es obligatorio'
  }),
  type: Joi.string().required().messages({
    'string.empty': 'El tipo es obligatorio'
  }),
  winery: Joi.string().trim().required().messages({
    'string.empty': 'La bodega es obligatoria'
  }),
  year: Joi.number().integer().min(1000).max(new Date().getFullYear()).required().messages({
    'number.min': 'Año inválido',
    'number.max': 'El año no puede ser en el futuro'
  }),
  region: Joi.string().required().messages({
    'string.empty': 'La región es obligatoria'
  }),
  variety: Joi.string().required().messages({
    'string.empty': 'La variedad de uva es obligatoria'
  }),
  imageUrl: Joi.string().uri().required().messages({
    'string.empty': 'La URL de la imagen es obligatoria',
    'string.uri': 'La URL de la imagen debe ser válida'
  })
});

const updateWineSchema = Joi.object({
  name: Joi.string().trim().optional(),
  type: Joi.string().optional(),
  winery: Joi.string().trim().optional(),
  year: Joi.number().integer().min(1000).max(new Date().getFullYear()).optional(),
  region: Joi.string().optional(),
  variety: Joi.string().optional(),
  imageUrl: Joi.string().uri().optional()
});

module.exports = {
  createWineSchema,
  updateWineSchema
};