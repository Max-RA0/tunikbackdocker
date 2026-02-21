'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('evaluacionservicios', {
      idevaluacionservicios: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      idventas: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'ventas',
          key: 'idventas'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      calificacion: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      comentario: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      fecha: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('evaluacionservicios');
  }
};
