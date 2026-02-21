'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('permisos', {
      idpermisos: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      codigo: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Código único del permiso, ej: inventory.productos.read'
      },
      descripcion: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Descripción legible del permiso'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('permisos');
  }
};
