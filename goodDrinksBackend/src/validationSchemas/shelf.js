const Joi = require('joi');

const addOrUpdateShelfSchema = Joi.object({
  wineId: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.empty': 'El ID del vino es requerido',
    'string.pattern.base': 'El ID del vino debe ser un ObjectId válido'
  }),
  status: Joi.string().valid('Por probar', 'Tomando', 'Ya tomados').required().messages({
    'any.only': 'El estado debe ser "Por probar", "Tomando" o "Ya tomados"',
    'string.empty': 'El estado es requerido'
  })
});

module.exports = {
  addOrUpdateShelfSchema
};