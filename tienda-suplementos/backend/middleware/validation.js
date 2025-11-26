const Joi = require('joi');

const validateEmail = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Debe ser un email válido',
      'any.required': 'El email es requerido'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

const validateVerifyEmail = (req, res, next) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Debe ser un email válido',
      'any.required': 'El email es requerido'
    }),
    code: Joi.string().length(6).pattern(/^[0-9]+$/).required().messages({
      'string.length': 'El código debe tener 6 dígitos',
      'string.pattern.base': 'El código debe contener solo números',
      'any.required': 'El código es requerido'
    })
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message
    });
  }
  next();
};

module.exports = {
  validateEmail,
  validateVerifyEmail
};
