const { Producto, Proveedor, Pedido, DetallePedidoProducto } = require('../models');
const { Op } = require('sequelize');

class InventoryService {
  // PRODUCTOS
  async findAllProductos(query = {}) {
    const { q } = query;
    const where = {};
    if (q) where.nombreproductos = { [Op.like]: `%${q}%` };

    return await Producto.findAll({
      where,
      include: [{ model: Proveedor, as: 'proveedor' }],
    });
  }

  async createProducto(data) {
    return await Producto.create(data);
  }

  async updateProducto(idproductos, data) {
    const producto = await Producto.findByPk(idproductos);
    if (!producto) {
      const error = new Error('Producto no encontrado');
      error.statusCode = 404;
      throw error;
    }
    await producto.update(data);
    return producto;
  }

  async deleteProducto(idproductos) {
    const producto = await Producto.findByPk(idproductos);
    if (!producto) {
      const error = new Error('Producto no encontrado');
      error.statusCode = 404;
      throw error;
    }
    await producto.destroy();
    return { message: 'Producto eliminado exitosamente' };
  }

  // PROVEEDORES
  async findAllProveedores() {
    return await Proveedor.findAll();
  }

  async createProveedor(data) {
    return await Proveedor.create(data);
  }

  async updateProveedor(idproveedor, data) {
    const proveedor = await Proveedor.findByPk(idproveedor);
    if (!proveedor) {
      const error = new Error('Proveedor no encontrado');
      error.statusCode = 404;
      throw error;
    }
    await proveedor.update(data);
    return proveedor;
  }

  async deleteProveedor(idproveedor) {
    const proveedor = await Proveedor.findByPk(idproveedor);
    if (!proveedor) {
      const error = new Error('Proveedor no encontrado');
      error.statusCode = 404;
      throw error;
    }
    await proveedor.destroy();
    return { message: 'Proveedor eliminado exitosamente' };
  }

  // PEDIDOS
  async findAllPedidos(query = {}) {
    const { estado, idproveedor } = query;
    const where = {};
    if (estado) where.estado = estado;
    if (idproveedor) where.idproveedor = idproveedor;

    return await Pedido.findAll({
      where,
      include: [{ model: Proveedor, as: 'proveedor' },
        { model: DetallePedidoProducto, as: 'detalles', include: [{ model: Producto, as: 'producto' }] },
      ],
      order: [['fechaPedido', 'DESC']],
    });
  }

  async findPedidoById(idpedidos) {
    const pedido = await Pedido.findByPk(idpedidos, {
      include: [{ model: Proveedor, as: 'proveedor' }],
    });
    if (!pedido) {
      const error = new Error('Pedido no encontrado');
      error.statusCode = 404;
      throw error;
    }
    return pedido;
  }

  async createPedido(data) {
    const idproveedor = Number(data?.idproveedor);
    if (!idproveedor) {
      const error = new Error('Proveedor es requerido');
      error.statusCode = 400;
      throw error;
    }

    const proveedor = await Proveedor.findByPk(idproveedor);
    if (!proveedor) {
      const error = new Error('Proveedor no válido');
      error.statusCode = 400;
      throw error;
    }

    const pedido = await Pedido.create({
      ...data,
      idproveedor,
      estado: data.estado || 'Pendiente',
    });

    return await this.findPedidoById(pedido.idpedidos);
  }

  async updatePedido(idpedidos, data) {
    const pedido = await Pedido.findByPk(idpedidos);
    if (!pedido) {
      const error = new Error('Pedido no encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (data?.idproveedor !== undefined && data?.idproveedor !== null) {
      const idproveedor = Number(data.idproveedor);
      const proveedor = await Proveedor.findByPk(idproveedor);
      if (!proveedor) {
        const error = new Error('Proveedor no válido');
        error.statusCode = 400;
        throw error;
      }
    }

    await pedido.update(data);
    return await this.findPedidoById(idpedidos);
  }

  async deletePedido(idpedidos) {
    const pedido = await Pedido.findByPk(idpedidos);
    if (!pedido) {
      const error = new Error('Pedido no encontrado');
      error.statusCode = 404;
      throw error;
    }
    await pedido.destroy();
    return { message: 'Pedido eliminado exitosamente' };
  }

  // DETALLES
  async findAllDetallesPedido() {
    return await DetallePedidoProducto.findAll();
  }

  async findDetallesByPedido(idpedidos) {
    return await DetallePedidoProducto.findAll({
      where: { idpedido: Number(idpedidos) },
    });
  }

  async createDetallePedido(detalleData) {
    const idpedido = Number(detalleData?.idpedido);
    const idproveedor = Number(detalleData?.idproveedor);
    const idproducto = Number(detalleData?.idproducto);
    const cantidad = Number(detalleData?.cantidad);

    if (!idpedido || !idproveedor || !idproducto || !cantidad) {
      const error = new Error('Datos de detalle incompletos');
      error.statusCode = 400;
      throw error;
    }

    const pedido = await Pedido.findByPk(idpedido);
    if (!pedido) {
      const error = new Error('Pedido no válido');
      error.statusCode = 400;
      throw error;
    }

    if (Number(pedido.idproveedor) !== idproveedor) {
      const error = new Error('El proveedor no coincide con el pedido');
      error.statusCode = 400;
      throw error;
    }

    const producto = await Producto.findByPk(idproducto);
    if (!producto) {
      const error = new Error('Producto no válido');
      error.statusCode = 400;
      throw error;
    }

    if (Number(producto.idproveedor) !== idproveedor) {
      const error = new Error('El producto no pertenece al proveedor seleccionado');
      error.statusCode = 400;
      throw error;
    }

    return await DetallePedidoProducto.create({
      ...detalleData,
      idpedido,
      idproveedor,
      idproducto,
      cantidad,
    });
  }

  async updateDetallePedido(idpedido, idproducto, data) {
    const detalle = await DetallePedidoProducto.findOne({
      where: { idpedido: Number(idpedido), idproducto: Number(idproducto) },
    });

    if (!detalle) {
      const error = new Error('Detalle de pedido no encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (data?.cantidad !== undefined && Number(data.cantidad) < 1) {
      const error = new Error('Cantidad debe ser mayor a 0');
      error.statusCode = 400;
      throw error;
    }

    await detalle.update(data);
    return detalle;
  }

  async deleteDetallePedido(idpedido, idproducto) {
    const detalle = await DetallePedidoProducto.findOne({
      where: { idpedido: Number(idpedido), idproducto: Number(idproducto) },
    });

    if (!detalle) {
      const error = new Error('Detalle de pedido no encontrado');
      error.statusCode = 404;
      throw error;
    }

    await detalle.destroy();
    return { message: 'Detalle de pedido eliminado exitosamente' };
  }
}

module.exports = new InventoryService();      