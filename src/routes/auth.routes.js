// routes/auth.routes.js
// KEYWORDS: AUTH_ROUTES / LOGIN / REGISTER / ACL / VERIFYTOKEN

const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");

const router = express.Router();

// POST /api/auth/register
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Email inválido"),
    body("contrasena").isLength({ min: 4 }).withMessage("Contraseña inválida"),
    validate,
  ],
  authController.register
);

// POST /api/auth/login
router.post(
  "/login",
  [
    body("email").notEmpty().withMessage("Email requerido"),
    body("contrasena").notEmpty().withMessage("Contraseña requerida"),
    validate,
  ],
  authController.login
);

// GET /api/auth/acl (requiere token)
router.get("/acl", verifyToken, authController.acl);

// POST /api/auth/refresh
router.post(
  "/refresh",
  [body("refreshToken").notEmpty().withMessage("refreshToken requerido"), validate],
  authController.refresh
);

router.post("/logout", verifyToken, authController.logout);

// forgot/reset
router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Email inválido"), validate],
  authController.forgotPassword
);

router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Token requerido"),
    body("newPassword").isLength({ min: 4 }).withMessage("Contraseña inválida"),
    validate,
  ],
  authController.resetPassword
);

module.exports = router;