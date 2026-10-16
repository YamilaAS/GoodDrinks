// src/middlewares/validate.js
const validate = (schema, target = 'body') => {
  return (req, res, next) => {
    const { error } = schema.validate(req[target], { abortEarly: false });
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({ error: errorMessage });
    }
    next();
  };
};

module.exports = validate;