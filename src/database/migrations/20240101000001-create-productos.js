'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('productos', {
      idproductos: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombreproducto: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      precio: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('productos');
  }
};
