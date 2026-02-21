'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pedidos', {
      idpedidos: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      idproveedor: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'proveedores',
          key: 'idproveedor'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      idproductos: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'productos',
          key: 'idproductos'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      estado: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'Pendiente'
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pedidos');
  }
};
