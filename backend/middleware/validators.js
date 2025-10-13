// src/middlewares/validators.js
import { body, validationResult } from 'express-validator';

// Respuesta estándar 422 con listado de errores por campo
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  return res.status(422).json({
    ok: false,
    errors: errors.array().map(e => ({ field: e.param, msg: e.msg }))
  });
};

// Email requerido y válido
export const emailV = [
  body('email')
    .exists().withMessage('Email es requerido')
    .bail()
    .isEmail().withMessage('Email inválido')
    .bail()
    .normalizeEmail()
];

// Password con reglas mínimas de robustez
export const passwordV = [
  body('password')
    .exists().withMessage('Contraseña es requerida')
    .bail()
    .isString().withMessage('Contraseña inválida')
    .bail()
    .isLength({ min: 8 }).withMessage('Mínimo 8 caracteres')
    .matches(/[A-Z]/).withMessage('Debe incluir una mayúscula')
    .matches(/[a-z]/).withMessage('Debe incluir una minúscula')
    .matches(/\d/).withMessage('Debe incluir un número')
    .matches(/[\W_]/).withMessage('Debe incluir un símbolo')
];

// Token de reset
export const tokenV = [
  body('token')
    .exists().withMessage('Token es requerido')
    .bail()
    .isString().withMessage('Token inválido')
    .isLength({ min: 10 }).withMessage('Token demasiado corto')
];

// Nueva contraseña (para reset/change)
export const newPasswordV = [
  body('newPassword')
    .exists().withMessage('Nueva contraseña es requerida')
    .bail()
    .isLength({ min: 8 }).withMessage('Mínimo 8 caracteres')
    .matches(/[A-Z]/).withMessage('Debe incluir una mayúscula')
    .matches(/[a-z]/).withMessage('Debe incluir una minúscula')
    .matches(/\d/).withMessage('Debe incluir un número')
    .matches(/[\W_]/).withMessage('Debe incluir un símbolo')
];

// (Opcional) validador para /change-password
export const currentPasswordV = [
  body('currentPassword')
    .exists().withMessage('Contraseña actual es requerida')
    .bail()
    .isString().isLength({ min: 8 }).withMessage('Contraseña actual inválida')
];
