'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Insertar permisos base para inventario
    await queryInterface.bulkInsert('permisos', [
      // Productos
      { idpermisos: 1, codigo: 'inventory.productos.read', descripcion: 'Ver productos' },
      { idpermisos: 2, codigo: 'inventory.productos.create', descripcion: 'Crear productos' },
      { idpermisos: 3, codigo: 'inventory.productos.update', descripcion: 'Actualizar productos' },
      { idpermisos: 4, codigo: 'inventory.productos.delete', descripcion: 'Eliminar productos' },
      // Proveedores
      { idpermisos: 5, codigo: 'inventory.proveedores.read', descripcion: 'Ver proveedores' },
      { idpermisos: 6, codigo: 'inventory.proveedores.create', descripcion: 'Crear proveedores' },
      { idpermisos: 7, codigo: 'inventory.proveedores.update', descripcion: 'Actualizar proveedores' },
      { idpermisos: 8, codigo: 'inventory.proveedores.delete', descripcion: 'Eliminar proveedores' },
      // Pedidos
      { idpermisos: 9, codigo: 'inventory.pedidos.read', descripcion: 'Ver pedidos' },
      { idpermisos: 10, codigo: 'inventory.pedidos.create', descripcion: 'Crear pedidos' },
      { idpermisos: 11, codigo: 'inventory.pedidos.update', descripcion: 'Actualizar pedidos' },
      { idpermisos: 12, codigo: 'inventory.pedidos.delete', descripcion: 'Eliminar pedidos' },
      // Usuarios (admin)
      { idpermisos: 13, codigo: 'usuarios.read', descripcion: 'Ver usuarios' },
      { idpermisos: 14, codigo: 'usuarios.create', descripcion: 'Crear usuarios' },
      { idpermisos: 15, codigo: 'usuarios.update', descripcion: 'Actualizar usuarios' },
      { idpermisos: 16, codigo: 'usuarios.delete', descripcion: 'Eliminar usuarios' },
      // Roles y permisos (admin)
      { idpermisos: 17, codigo: 'roles.read', descripcion: 'Ver roles' },
      { idpermisos: 18, codigo: 'roles.update', descripcion: 'Actualizar roles' },
      { idpermisos: 19, codigo: 'permisos.read', descripcion: 'Ver permisos' },
      { idpermisos: 20, codigo: 'permisos.assign', descripcion: 'Asignar permisos a roles' }
    ]);

    // Asignar TODOS los permisos al rol administrador (idroles = 1)
    const adminPermisos = Array.from({ length: 20 }, (_, i) => ({
      idroles: 1,
      idpermisos: i + 1
    }));

    await queryInterface.bulkInsert('roles_permisos', adminPermisos);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles_permisos', { idroles: 1 });
    await queryInterface.bulkDelete('permisos', {});
  }
};
