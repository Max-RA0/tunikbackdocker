const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const DetalleAgendaCita = sequelize.define('DetalleAgendaCita', {
  iddetalleagenda: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  idagendacitas: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'agendacitas',
      key: 'idagendacitas'
    }
  },
  idservicios: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'servicios',
      key: 'idservicios'
    }
  },
  cantidad: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  precio_unitario: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  descripcionvehiculo: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  placa: {
    type: DataTypes.STRING(20),
    allowNull: true
  }
}, {
  tableName: 'detalleagendacitas',
  timestamps: false
});

module.exports = DetalleAgendaCita;
