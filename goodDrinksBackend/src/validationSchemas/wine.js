const Joi = require('joi');

const createWineSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'El nombre del vino es obligatorio'
  }),
  type: Joi.string().required(),
  winery: Joi.string().required(),
  year: Joi.number().integer().min(1800).max(new Date().getFullYear()).required(),
  region: Joi.string().optional(),
  variety: Joi.string().optional(),
  imageUrl: Joi.string().uri().optional()
});

const updateWineSchema = Joi.object({
  name: Joi.string().optional(),
  type: Joi.string().optional(),
  winery: Joi.string().optional(),
  year: Joi.number().integer().min(1800).max(new Date().getFullYear()).optional(),
  region: Joi.string().optional(),
  variety: Joi.string().optional(),
  imageUrl: Joi.string().uri().optional()
});

module.exports = {
  createWineSchema,
  updateWineSchema
};