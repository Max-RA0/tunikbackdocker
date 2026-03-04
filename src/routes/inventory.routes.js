const express = require('express');
const { body } = require('express-validator');
const inventoryController = require('../controllers/inventory.controller');
const { verifyToken, requirePermission } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// ========== LOOKUPS (MIN) ==========
// KEYWORDS: LOOKUPS / MIN_FIELDS / FLOW_PERMISSION
router.get('/proveedores', requirePermission('pedidos.create'), inventoryController.findAllProveedores);

// ========== PRODUCTOS ==========
router.get('/productos', requirePermission('productos.read'), inventoryController.findAllProductos);

router.post(
  '/productos',
  [
    requirePermission('productos.create'),
    body('nombreproductos').notEmpty().withMessage('Nombre del producto es requerido'),
    body('precio').isDecimal().withMessage('Precio es requerido'),
    body('cantidadexistente').isInt({ min: 0 }).withMessage('Cantidad existente es requerida'),
    validate,
  ],
  inventoryController.createProducto
);

router.put('/productos/:idproductos', requirePermission('productos.update'), inventoryController.updateProducto);
router.delete('/productos/:idproductos', requirePermission('productos.delete'), inventoryController.deleteProducto);

// ========== PROVEEDORES ==========
router.get('/proveedores', requirePermission('proveedores.read'), inventoryController.findAllProveedores);

router.post(
  '/proveedores',
  [
    requirePermission('proveedores.create'),
    body('nombreproveedor').notEmpty().withMessage('Nombre del proveedor es requerido'),
    validate,
  ],
  inventoryController.createProveedor
);

router.put('/proveedores/:idproveedor', requirePermission('proveedores.update'), inventoryController.updateProveedor);
router.delete('/proveedores/:idproveedor', requirePermission('proveedores.delete'), inventoryController.deleteProveedor);

// ========== PEDIDOS ==========
router.get('/pedidos', requirePermission('pedidos.read'), inventoryController.findAllPedidos);
router.get('/pedidos/:idpedidos', requirePermission('pedidos.read'), inventoryController.findPedidoById);

router.post(
  '/pedidos',
  [
    requirePermission('pedidos.create'),
    body('idproveedor').isInt().withMessage('Proveedor es requerido'),
    body('fechaPedido').notEmpty().withMessage('Fecha del pedido es requerida'),
    validate,
  ],
  inventoryController.createPedido
);

router.put('/pedidos/:idpedidos', requirePermission('pedidos.update'), inventoryController.updatePedido);
router.delete('/pedidos/:idpedidos', requirePermission('pedidos.delete'), inventoryController.deletePedido);

// ========== DETALLES DE PEDIDO ==========
router.get('/detallepedidos', requirePermission('pedidos.read'), inventoryController.findAllDetallesPedido);
router.get('/detallepedidos/pedido/:idpedidos', requirePermission('pedidos.read'), inventoryController.findDetallesByPedido);

router.post(
  '/detallepedidos',
  [
    requirePermission('pedidos.create'),
    body('idpedido').isInt().withMessage('ID de pedido es requerido'),
    body('idproveedor').isInt().withMessage('ID de proveedor es requerido'),
    body('idproducto').isInt().withMessage('ID de producto es requerido'),
    body('cantidad').isInt({ min: 1 }).withMessage('Cantidad debe ser mayor a 0'),
    validate,
  ],
  inventoryController.createDetallePedido
);

router.put('/detallepedidos/:idpedido/:idproducto', requirePermission('pedidos.update'), inventoryController.updateDetallePedido);
router.delete('/detallepedidos/:idpedido/:idproducto', requirePermission('pedidos.delete'), inventoryController.deleteDetallePedido);

module.exports = router;