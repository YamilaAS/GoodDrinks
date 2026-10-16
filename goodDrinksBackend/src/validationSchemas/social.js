const Joi = require('joi');

const followParamSchema = Joi.object({
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/).required().messages({
    'string.pattern.base': 'El ID de usuario debe ser un ObjectId válido'
  })
});

module.exports = {
  followParamSchema
};