// routes/permisos.routes.js
// KEYWORDS: PERMISOS_ROUTES / ADMIN_ONLY / VERIFYTOKEN / SAFE

const express = require("express");
const { body } = require("express-validator");
const permisosController = require("../controllers/permisos.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");
const response = require("../utils/response.util");

const router = express.Router();

// Todas requieren auth
router.use(verifyToken);

// KEYWORDS: ADMIN_ONLY (idroles === 1)
router.use((req, res, next) => {
  const roleId = Number(req.user?.idroles);
  if (roleId === 1) return next();
  return response.forbidden(res, "Solo administrador puede gestionar permisos");
});

// GET /api/permisos/modulos
router.get("/modulos", permisosController.findAllModulos);

// GET /api/permisos/acciones
router.get("/acciones", permisosController.findAllAcciones);

// GET /api/permisos/roles/:idroles
router.get("/roles/:idroles", permisosController.getPermisosByRole);

// PUT /api/permisos/roles/:idroles  body: { permisos: [...] }
router.put(
  "/roles/:idroles",
  [body("permisos").isArray().withMessage("permisos debe ser un array"), validate],
  permisosController.assignPermisosToRole
);

// POST /api/permisos/roles/:idroles  body: { idmodulo, idaccion }
router.post(
  "/roles/:idroles",
  [
    body("idmodulo").isInt().withMessage("idmodulo es requerido"),
    body("idaccion").isInt().withMessage("idaccion es requerido"),
    validate,
  ],
  permisosController.addPermisoToRole
);

// DELETE /api/permisos/roles/:idroles/:idmodulo/:idaccion
router.delete(
  "/roles/:idroles/:idmodulo/:idaccion",
  permisosController.removePermisoFromRole
);

module.exports = router;