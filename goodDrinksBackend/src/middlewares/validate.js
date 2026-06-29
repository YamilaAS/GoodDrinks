const validate = (schema) => (req, res, next) => {
    // Valida el cuerpo de la petición contra el esquema de Joi
    const { error } = schema.validate(req.body, { abortEarly: false }); // abortEarly: false muestra todos los errores juntos si hay más de uno
    
    if (error) {
        // Devolvemos el error con la propiedad 'error' para mantener la consistencia del backend
        return res.status(400).json({ 
            error: error.details.map(detail => detail.message).join(', ') 
        });
    }
    next();
};

module.exports = validate;