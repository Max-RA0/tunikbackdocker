'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('proveedores', {
      idproveedor: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombreproveedor: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      telefono: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: true
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('proveedores');
  }
};
