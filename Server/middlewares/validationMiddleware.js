const { body, validationResult } = require("express-validator");

// Middleware de validación para la creación de usuarios
const validateUser = [
  body("name")
    .notEmpty().withMessage("El nombre es obligatorio")
    .isLength({ min: 3 }).withMessage("El nombre debe tener al menos 3 caracteres"),
  
  body("lastname")
    .notEmpty().withMessage("El apellido es obligatorio")
    .isLength({ min: 3 }).withMessage("El apellido debe tener al menos 3 caracteres"),
  
  body("email")
    .notEmpty().withMessage("El correo es obligatorio")
    .isEmail().withMessage("Debe ser un correo electrónico válido"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = validateUser;

