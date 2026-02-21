const express = require('express');
const { body } = require('express-validator');
const ratingsController = require('../controllers/ratings.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// GET /api/evaluaciones
router.get('/evaluaciones', ratingsController.findAll);

// GET /api/evaluaciones/summary
router.get('/evaluaciones/summary', ratingsController.getSummary);

// GET /api/evaluaciones/:idevaluacion
router.get('/evaluaciones/:idevaluacion', ratingsController.findById);

// POST /api/evaluaciones
router.post('/evaluaciones', [
  body('numero_documento').notEmpty().withMessage('Número de documento es requerido'),
  body('idservicios').isInt().withMessage('ID de servicio es requerido'),
  validate
], ratingsController.create);

// PUT /api/evaluaciones/:idevaluacion
router.put('/evaluaciones/:idevaluacion', ratingsController.update);

// DELETE /api/evaluaciones/:idevaluacion
router.delete('/evaluaciones/:idevaluacion', ratingsController.delete);

module.exports = router;
