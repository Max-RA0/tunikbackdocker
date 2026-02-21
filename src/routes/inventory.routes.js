const express = require('express');
const { body } = require('express-validator');
const inventoryController = require('../controllers/inventory.controller');
const { verifyToken, requirePermission } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// ========== PRODUCTOS ==========
// GET /api/productos
router.get('/productos', requirePermission('productos.read'), inventoryController.findAllProductos);

// POST /api/productos
router.post('/productos', [
  requirePermission('productos.create'),
  body('nombreproductos').notEmpty().withMessage('Nombre del producto es requerido'),
  body('precio').isDecimal().withMessage('Precio es requerido'),
  body('cantidadexistente').isInt({ min: 0 }).withMessage('Cantidad existente es requerida'),
  validate
], inventoryController.createProducto);

// PUT /api/productos/:idproductos
router.put('/productos/:idproductos', requirePermission('productos.update'), inventoryController.updateProducto);

// DELETE /api/productos/:idproductos
router.delete('/productos/:idproductos', requirePermission('productos.delete'), inventoryController.deleteProducto);

// ========== PROVEEDORES ==========
// GET /api/proveedores
router.get('/proveedores', requirePermission('proveedores.read'), inventoryController.findAllProveedores);

// POST /api/proveedores
router.post('/proveedores', [
  requirePermission('proveedores.create'),
  body('nombreproveedor').notEmpty().withMessage('Nombre del proveedor es requerido'),
  validate
], inventoryController.createProveedor);

// PUT /api/proveedores/:idproveedor
router.put('/proveedores/:idproveedor', requirePermission('proveedores.update'), inventoryController.updateProveedor);

// DELETE /api/proveedores/:idproveedor
router.delete('/proveedores/:idproveedor', requirePermission('proveedores.delete'), inventoryController.deleteProveedor);

// ========== PEDIDOS ==========
// GET /api/pedidos
router.get('/pedidos', requirePermission('pedidos.read'), inventoryController.findAllPedidos);

// POST /api/pedidos
router.post('/pedidos', [
  requirePermission('pedidos.create'),
  body('idproveedor').isInt().withMessage('Proveedor es requerido'),
  body('fechaPedido').notEmpty().withMessage('Fecha del pedido es requerida'),
  validate
], inventoryController.createPedido);

// PUT /api/pedidos/:idpedidos
router.put('/pedidos/:idpedidos', requirePermission('pedidos.update'), inventoryController.updatePedido);

// DELETE /api/pedidos/:idpedidos
router.delete('/pedidos/:idpedidos', requirePermission('pedidos.delete'), inventoryController.deletePedido);

module.exports = router;
