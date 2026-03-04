const express = require('express');
const { body } = require('express-validator');
const permisosController = require('../controllers/permisos.controller');
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Solo administrador puede gestionar permisos
router.use(requireRole('administrador'));

// GET /api/permisos/modulos - Listar todos los módulos
router.get('/modulos', permisosController.findAllModulos);

// GET /api/permisos/acciones - Listar todas las acciones
router.get('/acciones', permisosController.findAllAcciones);

// GET /api/permisos/roles/:idroles - Obtener permisos de un rol
router.get('/roles/:idroles', permisosController.getPermisosByRole);

// PUT /api/permisos/roles/:idroles - Asignar permisos a un rol (reemplaza todos)
// Body: { permisos: [{ idmodulo, idaccion, permitido }] }
router.put('/roles/:idroles', [
  body('permisos').isArray().withMessage('permisos debe ser un array'),
  validate
], permisosController.assignPermisosToRole);

// POST /api/permisos/roles/:idroles - Agregar un permiso específico a un rol
// Body: { idmodulo, idaccion }
router.post('/roles/:idroles', [
  body('idmodulo').isInt().withMessage('idmodulo es requerido'),
  body('idaccion').isInt().withMessage('idaccion es requerido'),
  validate
], permisosController.addPermisoToRole);

// DELETE /api/permisos/roles/:idroles/:idmodulo/:idaccion - Eliminar un permiso específico
router.delete('/roles/:idroles/:idmodulo/:idaccion', permisosController.removePermisoFromRole);

module.exports = router;
