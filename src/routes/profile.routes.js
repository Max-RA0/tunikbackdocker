// routes/profile.routes.js
// KEYWORDS: PROFILE_ROUTES / ME / SELF_ONLY / VERIFYTOKEN_ONLY / NO_RBAC_USERS

const express = require("express");
const { body } = require("express-validator");
const profileController = require("../controllers/profile.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");

const router = express.Router();

// KEYWORDS: AUTH_ONLY
router.use(verifyToken);

// GET /api/profile/me
router.get("/me", profileController.me);

// PUT /api/profile/me
router.put(
  "/me",
  [
    // KEYWORDS: VALIDATION_OPTIONAL_FIELDS
    body("nombre").optional().notEmpty().withMessage("Nombre no puede estar vacío"),
    body("telefono").optional().notEmpty().withMessage("Teléfono no puede estar vacío"),
    body("email").optional().isEmail().withMessage("Email inválido"),
    validate,
  ],
  profileController.updateMe
);

module.exports = router;