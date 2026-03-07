// src/routes/appointments.routes.js
// KEYWORDS: AGENDA_ROUTES / MULTI_VEHICLES / DETALLES_INLINE / PLACA_OPTIONAL_HEADER

const express = require("express");
const { body } = require("express-validator");
const appointmentsController = require("../controllers/appointments.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validation.middleware");

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// ========== AGENDA DE CITAS ==========
// GET /api/agendacitas
router.get("/agendacitas", appointmentsController.findAll);

// GET /api/agendacitas/:idagendacitas
router.get("/agendacitas/:idagendacitas", appointmentsController.findById);

router.post(
  "/agendacitas",
  [
    body("fecha").notEmpty().withMessage("Fecha es requerida"),
    body("detalles")
      .isArray({ min: 1 })
      .withMessage("detalles debe ser un arreglo con mínimo 1 item"),
    body("detalles.*.placa")
      .notEmpty()
      .withMessage("Cada detalle debe tener placa")
      .isString()
      .withMessage("placa debe ser texto"),
    body("detalles.*.idservicios")
      .isInt({ min: 1 })
      .withMessage("Cada detalle debe tener idservicios válido"),
    body("detalles.*.precio_unitario")
      .isDecimal()
      .withMessage("Cada detalle debe tener precio_unitario válido"),
    body("detalles.*.cantidad")
      .optional()
      .isInt({ min: 1 })
      .withMessage("cantidad debe ser >= 1"),
    body("detalles").custom((_, { req }) => {
      const bad = req.body.detalles.find((d) => String(d?.descripcionvehiculo || "").trim());
      if (bad) throw new Error("descripcionvehiculo no está permitido en agenda");
      return true;
    }),
    validate,
  ],
  appointmentsController.create
);
// PUT /api/agendacitas/:idagendacitas
router.put(
  "/agendacitas/:idagendacitas",
  [
    body("fecha").optional().notEmpty().withMessage("Fecha es requerida"),

    body("detalles")
      .optional()
      .isArray({ min: 1 })
      .withMessage("detalles debe ser un arreglo con mínimo 1 item"),

    body("detalles.*.placa")
      .notEmpty()
      .withMessage("Cada detalle debe tener placa")
      .isString()
      .withMessage("placa debe ser texto"),

    body("detalles.*.idservicios")
      .isInt({ min: 1 })
      .withMessage("Cada detalle debe tener idservicios válido"),

    body("detalles.*.precio_unitario")
      .isDecimal()
      .withMessage("Cada detalle debe tener precio_unitario válido"),
    body("detalles.*.cantidad")
      .optional()
      .isInt({ min: 1 })
      .withMessage("cantidad debe ser >= 1"),
    body("detalles").custom((_, { req }) => {
      const hasDetalles = Array.isArray(req.body?.detalles) && req.body.detalles.length > 0;
      if (!hasDetalles) return true;
      const bad = req.body.detalles.find((d) => String(d?.descripcionvehiculo || "").trim());
      if (bad) throw new Error("descripcionvehiculo no está permitido en agenda");
      return true;
    }),

    validate,
  ],
  appointmentsController.update
);

// DELETE /api/agendacitas/:idagendacitas
router.delete("/agendacitas/:idagendacitas", appointmentsController.delete);

// ========== DETALLES DE AGENDA ==========
// GET /api/detalleagendacitas
router.get("/detalleagendacitas", appointmentsController.findAllDetalles);

// GET /api/detalleagendacitas/test
router.get("/detalleagendacitas/test", appointmentsController.testDetalles);

// GET /api/detalleagendacitas/agenda/:idagendacitas
router.get("/detalleagendacitas/agenda/:idagendacitas", appointmentsController.findDetallesByAgenda);

// GET /api/detalleagendacitas/agenda/:idagendacitas/total
router.get("/detalleagendacitas/agenda/:idagendacitas/total", appointmentsController.getTotalByAgenda);

// POST /api/detalleagendacitas
router.post(
  "/detalleagendacitas",
  [
    body("idagendacitas").isInt().withMessage("ID de agenda es requerido"),
    body("idservicios").isInt().withMessage("ID de servicio es requerido"),
    body("precio_unitario").isDecimal().withMessage("Precio unitario es requerido"),
    // KEYWORDS: OPTIONAL_FIELDS
    body("cantidad").optional().isInt({ min: 1 }).withMessage("cantidad debe ser >= 1"),
    body("placa").notEmpty().withMessage("placa es requerida").isString().withMessage("placa debe ser texto"),
    body("descripcionvehiculo").custom((v) => {
      if (String(v || "").trim()) throw new Error("descripcionvehiculo no está permitido en agenda");
      return true;
    }),
  ],
  appointmentsController.createDetalle
);

// PUT /api/detalleagendacitas/agenda/:idagendacitas/servicio/:idservicios
router.put(
  "/detalleagendacitas/agenda/:idagendacitas/servicio/:idservicios",
  appointmentsController.updateDetalle
);

// DELETE /api/detalleagendacitas/agenda/:idagendacitas/servicio/:idservicios
router.delete(
  "/detalleagendacitas/agenda/:idagendacitas/servicio/:idservicios",
  appointmentsController.deleteDetalle
);

module.exports = router;