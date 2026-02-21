'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('roles_permisos', {
      idroles: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'idroles'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      idpermisos: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'permisos',
          key: 'idpermisos'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      }
    });

    // Add composite primary key
    await queryInterface.addConstraint('roles_permisos', {
      fields: ['idroles', 'idpermisos'],
      type: 'primary key',
      name: 'pk_roles_permisos'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('roles_permisos');
  }
};
