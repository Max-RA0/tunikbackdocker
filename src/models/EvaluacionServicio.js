const { DataTypes } = require('sequelize');
const { sequelize } = require('../database/connection');

const EvaluacionServicio = sequelize.define('EvaluacionServicio', {
  idevaluacion: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_documento: {
    type: DataTypes.STRING(20),
    allowNull: false,
    references: {
      model: 'usuarios',
      key: 'numero_documento'
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
  respuestacalificacion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  comentarios: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'evaluacionservicios',
  timestamps: false
});

module.exports = EvaluacionServicio;
