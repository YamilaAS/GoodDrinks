const Joi = require('joi');

const createRatingSchema = Joi.object({
  wineId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.empty': 'El ID del vino es requerido',
    'string.pattern.base': 'El ID del vino debe ser un ObjectId válido'
  }),
  rating: Joi.number().min(1).max(5).required().messages({
    'number.base': 'La calificación debe ser un número',
    'number.min': 'La puntuación mínima es 1',
    'number.max': 'La puntuación máxima es 5'
  }),
  comments: Joi.string().max(500).allow('').optional().messages({
    'string.max': 'El comentario no puede superar los 500 caracteres'
  })
});

const updateRatingSchema = Joi.object({
  rating: Joi.number().min(1).max(5).optional(),
  comments: Joi.string().max(500).allow('').optional()
});

module.exports = {
  createRatingSchema,
  updateRatingSchema
};